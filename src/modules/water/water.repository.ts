import { Service } from 'typedi';
import { IWater, WaterModel } from '@/libs/db';
import { NotFoundError, BadRequestError } from 'routing-controllers';
import { FilterQuery } from 'mongoose';
import { Logger } from '@/libs/global';

@Service()
export class WaterRepository {
  constructor(private readonly logger: Logger) {}

  async create(waterData: Partial<IWater>): Promise<IWater> {
    try {
      const waterRecord = await WaterModel.create(waterData);
      return JSON.parse(JSON.stringify(waterRecord));
    } catch (error) {
      this.logger.error(`Error creating water consumption record: ${error}`);
      throw new BadRequestError('Error creating water consumption record.');
    }
  }

  async updateOne(
    filter: FilterQuery<IWater>,
    data: Partial<IWater>
  ): Promise<IWater> {
    const result = await WaterModel.findOneAndUpdate(filter, data, {
      new: true
    })
      .lean()
      .exec();

    if (!result) {
      this.logger.error(`Water consumption record not found to update it.`);
      throw new NotFoundError(
        `Water consumption record was not found to update it.`
      );
    }

    this.logger.log(`Water consumption record updated successfully`);
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

      if (waterRecords.length === 0) {
        return [];
      }

      return waterRecords.map((record) => JSON.parse(JSON.stringify(record)));
    } catch (err) {
      this.logger.error(`Error fetching water consumption records: ${err}`);
      throw new NotFoundError(`Error fetching water consumption records`);
    }
  }

  async deleteOne(filter: FilterQuery<IWater>): Promise<void> {
    const result = await WaterModel.findOneAndDelete(filter).exec();

    if (!result) {
      this.logger.log(`Water consumption record not found to delete it.`);
      throw new NotFoundError(
        `Water consumption record was not found to delete it.`
      );
    }
    this.logger.log(`Water consumption record deleted successfully`);
    return;
  }
}
