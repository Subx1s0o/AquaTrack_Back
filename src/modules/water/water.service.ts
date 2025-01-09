import { Service } from 'typedi';
import { Logger } from '@/libs/global';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
import { DeleteWaterDTO } from './dto/deleteWater';
import { GetDailyWaterDTO } from './dto/getDailyWater';
import { GetMonthlyWaterDTO } from './dto/getMonthlyWater';
import { WaterModel } from './../../../libs/db/models/water';
import { IWater } from './../../../libs/db/models/water';
import createHttpError from 'http-errors';

@Service()
class WaterService {
  constructor(private readonly logger: Logger) {}

  async addWaterConsumption(body: AddWaterDTO): Promise<IWater> {
    this.logger.log('Adding water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, volume, date } = body;

      const waterRecord = new WaterModel({
        userId,
        volume,
        date,
      });

      await waterRecord.save();
      this.logger.log('Water consumption record added successfully.');
      return waterRecord;
    } catch (err) {
      this.logger.log('Error while adding water consumption record: ' + err);
      throw createHttpError(500, 'Failed to add water consumption record');
    }
  }

  async editWaterConsumption(body: EditWaterDTO): Promise<IWater | null> {
    this.logger.log('Editing water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, date, volume } = body;

      const updatedRecord = await WaterModel.findOneAndUpdate(
        { userId, date },
        { volume }, 
      );

      if (!updatedRecord) {
        throw createHttpError(404, 'Record not found for the given date');
      }

      this.logger.log('Water consumption record updated successfully.');
      return updatedRecord;
    } catch (err) {
      this.logger.log('Error while editing water consumption record: ' + err);
      throw createHttpError(500, 'Failed to edit water consumption record');
    }
  }

  async deleteWaterConsumption(body: DeleteWaterDTO): Promise<{ message: string }> {
    this.logger.log('Deleting water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, date } = body;

      const deletedRecord = await WaterModel.findOneAndDelete({ userId, date });

      if (!deletedRecord) {
        throw createHttpError(404, 'Record not found for the given date');
      }

      this.logger.log('Water consumption record deleted successfully.');
      return { message: 'Record deleted successfully' };
    } catch (err) {
      this.logger.log('Error while deleting water consumption record: ' + err);
      throw createHttpError(500, 'Failed to delete water consumption record');
    }
  }

  async getDailyWaterConsumption(query: GetDailyWaterDTO): Promise<{ totalVolume: number }> {
    this.logger.log('Fetching daily water consumption: ' + JSON.stringify(query));
    try {
      const { userId, date } = query;

      const dailyConsumption = await WaterModel.aggregate([
        { $match: { userId, date } },
        { $group: { _id: null, totalVolume: { $sum: '$volume' } } }
      ]);

      this.logger.log('Daily water consumption data retrieved successfully.');
      return { totalVolume: dailyConsumption[0]?.totalVolume || 0 };
    } catch (err) {
      this.logger.log('Error while fetching daily water consumption: ' + err);
      throw createHttpError(500, 'Failed to fetch daily water consumption');
    }
  }


  async getMonthlyWaterConsumption(query: GetMonthlyWaterDTO): Promise<{ totalVolume: number }> {
    this.logger.log('Fetching monthly water consumption: ' + JSON.stringify(query));
    try {
      const { userId, month, year } = query;

      const monthlyConsumption = await WaterModel.aggregate([
        { $match: { userId, date: { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${parseInt(month) + 1}-01`) } } },
        { $group: { _id: null, totalVolume: { $sum: '$volume' } } }
      ]);

      this.logger.log('Monthly water consumption data retrieved successfully.');
      return { totalVolume: monthlyConsumption[0]?.totalVolume || 0 };
    } catch (err) {
      this.logger.log('Error while fetching monthly water consumption: ' + err);
      throw createHttpError(500, 'Failed to fetch monthly water consumption');
    }
  }
}

export default WaterService;
