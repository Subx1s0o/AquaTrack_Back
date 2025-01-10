import { Service } from 'typedi';
import { IWater, WaterModel } from '@/libs/db';
import { NotFoundError, BadRequestError, HttpError } from 'routing-controllers';
import { FilterQuery } from 'mongoose';

@Service()
export class WaterRepository {
  async create(waterData: Partial<IWater>): Promise<IWater> {
    try {
      const water = await WaterModel.create(waterData);
      return JSON.parse(JSON.stringify(water));
    } catch (error) {
      const err = error as { code?: number; keyValue?: object };
      if (err.code === 11000) {
        throw new HttpError(409, 'Water record already exists');
      }
      throw new BadRequestError('Error creating water consumption record.');
    }
  }

  async updateOne(
    filter: FilterQuery<IWater>,
    data: Partial<IWater>
  ): Promise<IWater> {
    const result = await WaterModel.findOneAndUpdate(filter, data, {
      new: true
    }).exec();
    if (!result) {
      throw new NotFoundError(`Water consumption record was not found to update it.`);
    }
    return JSON.parse(JSON.stringify(result));
  }

  async findOne(filter: FilterQuery<IWater>): Promise<IWater> {
    const water = await WaterModel.findOne(filter).lean().exec();
    if (!water) {
      throw new NotFoundError(`Water consumption record was not found.`);
    }
    return JSON.parse(JSON.stringify(water));
  }

  async findAll(filter: FilterQuery<IWater> = {}): Promise<IWater[]> {
    try {
      const waterRecords = await WaterModel.find(filter).lean().exec();

      if (!waterRecords.length) {
        throw new NotFoundError('No water consumption records found');
      }

      return waterRecords;
    } catch (err) {
      throw new Error('Error fetching water consumption records');
    }
  }

  async deleteOne(filter: FilterQuery<IWater>): Promise<void> {
    const result = await WaterModel.findOneAndDelete(filter).exec();
    if (!result) {
      throw new NotFoundError(`Water consumption record was not found to delete it.`);
    }
    return;
  }
}
