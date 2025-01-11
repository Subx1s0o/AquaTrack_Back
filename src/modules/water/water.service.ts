import { Service } from 'typedi';
import { Logger } from '@/libs/global';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
import { DeleteWaterDTO } from './dto/deleteWater';
import { GetDailyWaterDTO } from './dto/getDailyWater';
import { GetMonthlyWaterDTO } from './dto/getMonthlyWater';
import { WaterRepository } from '@/libs/db/water.repository';  
import { IWater } from '@/libs/db/models/water';
import { BadRequestError, NotFoundError } from 'routing-controllers';  
import { UserRepository } from '@/libs/db/user.repository';
import { Types } from 'mongoose';

@Service()
class WaterService {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly waterRepository: WaterRepository  
  ) {}

  async addWaterConsumption(body: AddWaterDTO, userId: string): Promise<IWater> {
    this.logger.log('Adding water consumption record: ' + JSON.stringify(body));
    
    const { volume, date } = body;
  
    try {
      const user = await this.userRepository.findOne({ _id: userId });
      if (!user) {
        this.logger.log('User not found with ID: ' + userId);
        throw new NotFoundError('User not found');
      }
  
      const waterRecord = await this.waterRepository.create({
        userId: new Types.ObjectId(userId),
        volume,
        date,
      });
  
      this.logger.log('Water consumption record added successfully.');
      return waterRecord;
  
    } catch (err) {
      this.logger.log('Error while adding water consumption record: ' + err);
      throw new BadRequestError(`Failed to add water consumption record ${err}`);
    }
  }

  async editWaterConsumption(body: EditWaterDTO, waterId: string, userId: string): Promise<IWater | null> {
    this.logger.log('Editing water consumption record: ' + JSON.stringify(body));
  
    try {
      const { date, volume } = body;
  

      const existingRecord = await this.waterRepository.findOne({ _id: waterId });
  
      if (!existingRecord) {
        throw new NotFoundError('Record not found for the given waterId');
      }
  

      if (existingRecord.userId.toString() !== userId) {
        throw new Error('You can only edit your own records');
      }
  

      const updatedRecord = await this.waterRepository.updateOne(
        { _id: waterId, userId }, 
        { volume, date }
      );
  
      if (!updatedRecord) {
        throw new NotFoundError('Failed to update the water consumption record');
      }
  
      this.logger.log('Water consumption record updated successfully.');
      return updatedRecord;
    } catch (err) {
      this.logger.log('Error while editing water consumption record: ' + err);
      throw new BadRequestError('Failed to edit water consumption record');
    }
  }

  async deleteWaterConsumption(waterId: string, userId: string): Promise<{ message: string }> {
    this.logger.log('Deleting water consumption record: ' + waterId);
  
    try {

      const existingRecord = await this.waterRepository.findOne({ _id: waterId });
  
      if (!existingRecord) {
        throw new NotFoundError('Record not found for the given waterId');
      }
  
      if (existingRecord.userId.toString() !== userId) {
        throw new Error('You can only delete your own records');
      }
  

      await this.waterRepository.deleteOne({ _id: waterId, userId });
  
      this.logger.log('Water consumption record deleted successfully.');
      return { message: 'Record deleted successfully' };
    } catch (err) {
      this.logger.log('Error while deleting water consumption record: ' + err);
      throw new BadRequestError('Failed to delete water consumption record');
    }
  }

  async getDailyWaterConsumption(yearMonthDay: string, userId: string): Promise<object[]> {
    this.logger.log('Fetching daily water consumption for date: ' + yearMonthDay);
  
    try {
      const formattedDate = new Date(yearMonthDay).toISOString().split('T')[0]; 
  
      const dailyConsumption = await this.waterRepository.findAll({
        userId,
      });
  
      if (dailyConsumption.length === 0) {
        throw new NotFoundError('No daily water consumption found for the given date');
      }
  
      const filteredRecords = dailyConsumption.filter((record) => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === formattedDate;
      });
  
      if (filteredRecords.length === 0) {
        throw new NotFoundError('No daily water consumption found for the given date');
      }
  
      this.logger.log('Daily water consumption data retrieved successfully.');
      return filteredRecords.map((record) => ({
        date: record.date,
        volume: record.volume,
      }));
    } catch (err) {
      this.logger.log('Error while fetching daily water consumption: ' + err);
      throw new BadRequestError('Failed to fetch daily water consumption');
    }
  }

  async getMonthlyWaterConsumption({
    year, 
    month, 
    userId
  }: {
    year: string;
    month: string;
    userId: string;
  }): Promise<object[]> {
    this.logger.log('Fetching monthly water consumption for year ' + year + ' and month ' + month);
  
    try {
      
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${parseInt(month) + 1}-01`);
  
      const monthlyConsumption = await this.waterRepository.findAll({
        userId,
        date: { $gte: startDate, $lt: endDate }
      });
  
      if (monthlyConsumption.length === 0) {
        throw new NotFoundError('No monthly water consumption found for the given period');
      }
  
      const user = await this.userRepository.findOne({ _id: userId });
      if (!user) {
        throw new NotFoundError('User not found');
      }
  
      const dailyNorm = user.dailyNorm; 
  
      
      const consumptionStats = [];
  
      
      for (let day = 1; day <= 31; day++) {
        const currentDate = new Date(`${year}-${month}-${day}`);
        if (currentDate.getMonth() + 1 !== parseInt(month)) continue; 
  
        
        const dailyRecords = monthlyConsumption.filter((record) => {
          const recordDate = new Date(record.date);
          const recordYearMonth = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;
          
         
          return recordYearMonth === `${year}-${month}`;
        });
  
        const dailyTotalVolume = dailyRecords.reduce((total, record) => total + record.volume, 0);
  
        
        const percentageConsumed = dailyNorm > 0 ? (dailyTotalVolume / dailyNorm) * 100 : 0;
  
       
        consumptionStats.push({
          date: currentDate.toISOString().split('T')[0], 
          percentageConsumed: percentageConsumed.toFixed(2), 
        });
      }
  
      this.logger.log('Monthly water consumption data retrieved successfully.');
      return consumptionStats;
    } catch (err) {
      this.logger.log('Error while fetching monthly water consumption: ' + err);
      throw new BadRequestError('Failed to fetch monthly water consumption');
    }
  }
}

export default WaterService;
