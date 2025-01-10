import { Service } from 'typedi';
import { Body } from 'routing-controllers';
import { Logger } from '@/libs/global';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
import { DeleteWaterDTO } from './dto/deleteWater';
import { GetDailyWaterDTO } from './dto/getDailyWater';
import { GetMonthlyWaterDTO } from './dto/getMonthlyWater';
import { WaterModel } from '@/libs/db/models/water';
import { IWater } from '@/libs/db/models/water';
import createHttpError from 'http-errors';
import { UserModel } from '@/libs/db';

@Service()
class WaterService {
  constructor(private readonly logger: Logger) {}

  async addWaterConsumption(body: AddWaterDTO): Promise<IWater> {
    this.logger.log('Adding water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, volume, date } = body;
  
      const user = await UserModel.findById(userId);
      if (!user) {
        this.logger.log('User not found with ID: ' + userId);
        throw createHttpError(404, 'User not found');
      }
  
      const waterRecord = await WaterModel.create({
        userId,
        volume,
        date,
      });
  
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

  async getDailyWaterConsumption(@Body() body: GetDailyWaterDTO): Promise<object[]> {
    this.logger.log('Fetching daily water consumption: ' + JSON.stringify(body));
    try {
      const { userId, date } = body;
  
      const dailyConsumption = await WaterModel.find({ userId, date }).select('volume date');
  
      this.logger.log('Daily water consumption data retrieved successfully.');
      return dailyConsumption.map((record) => ({
        date: record.date,
        volume: record.volume,
      }));
    } catch (err) {
      this.logger.log('Error while fetching daily water consumption: ' + err);
      throw createHttpError(500, 'Failed to fetch daily water consumption');
    }
  }
  
  async getMonthlyWaterConsumption(@Body() body: GetMonthlyWaterDTO): Promise<object[]> {
    this.logger.log('Fetching monthly water consumption: ' + JSON.stringify(body));
    try {
      const { userId, month, year } = body;
  
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${parseInt(month) + 1}-01`);
  
      const monthlyConsumption = await WaterModel.find({
        userId,
        date: { $gte: startDate, $lt: endDate },
      }).select('volume date');
  
      this.logger.log('Monthly water consumption data retrieved successfully.');
      return monthlyConsumption.map((record) => ({
        date: record.date,
        volume: record.volume,
      }));
    } catch (err) {
      this.logger.log('Error while fetching monthly water consumption: ' + err);
      throw createHttpError(500, 'Failed to fetch monthly water consumption');
    }
  }
}

export default WaterService;
