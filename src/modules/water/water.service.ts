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

@Service()
class WaterService {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly waterRepository: WaterRepository  
  ) {}

  async addWaterConsumption(body: AddWaterDTO): Promise<IWater> {
    this.logger.log('Adding water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, volume, date } = body;

      const user = await this.userRepository.findOne({ _id: userId });
      if (!user) {
        this.logger.log('User not found with ID: ' + userId);
        throw new NotFoundError('User not found');
      }

      const waterRecord = await this.waterRepository.create({
        _id: userId,
        volume,
        date,
      });

      this.logger.log('Water consumption record added successfully.');
      return waterRecord;
    } catch (err) {
      this.logger.log('Error while adding water consumption record: ' + err);
      throw new BadRequestError('Failed to add water consumption record');
    }
  }

  async editWaterConsumption(body: EditWaterDTO): Promise<IWater | null> {
    this.logger.log('Editing water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, date, volume } = body;

      const updatedRecord = await this.waterRepository.updateOne(
        { userId, date },
        { volume }
      );

      if (!updatedRecord) {
        throw new NotFoundError('Record not found for the given date');
      }

      this.logger.log('Water consumption record updated successfully.');
      return updatedRecord;
    } catch (err) {
      this.logger.log('Error while editing water consumption record: ' + err);
      throw new BadRequestError('Failed to edit water consumption record');
    }
  }

  async deleteWaterConsumption(body: DeleteWaterDTO): Promise<{ message: string }> {
    this.logger.log('Deleting water consumption record: ' + JSON.stringify(body));
    try {
      const { userId, date } = body;

      await this.waterRepository.deleteOne({ userId, date });

      this.logger.log('Water consumption record deleted successfully.');
      return { message: 'Record deleted successfully' };
    } catch (err) {
      this.logger.log('Error while deleting water consumption record: ' + err);
      throw new BadRequestError('Failed to delete water consumption record');
    }
  }

  async getDailyWaterConsumption(body: GetDailyWaterDTO): Promise<object[]> {
    this.logger.log('Fetching daily water consumption: ' + JSON.stringify(body));
    try {
      const { userId, date } = body;

      const dailyConsumption = await this.waterRepository.findAll({
        userId,
        date
      });

      if (dailyConsumption.length === 0) {
        throw new NotFoundError('No daily water consumption found for the given date');
      }

      this.logger.log('Daily water consumption data retrieved successfully.');
      return dailyConsumption.map((record) => ({
        date: record.date,
        volume: record.volume,
      }));
    } catch (err) {
      this.logger.log('Error while fetching daily water consumption: ' + err);
      throw new BadRequestError('Failed to fetch daily water consumption');
    }
  }

  async getMonthlyWaterConsumption(body: GetMonthlyWaterDTO): Promise<object[]> {
    this.logger.log('Fetching monthly water consumption: ' + JSON.stringify(body));
    try {
      const { userId, month, year } = body;

      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${parseInt(month) + 1}-01`);

      const monthlyConsumption = await this.waterRepository.findAll({
        userId,
        date: { $gte: startDate, $lt: endDate }
      });

      if (monthlyConsumption.length === 0) {
        throw new NotFoundError('No monthly water consumption found for the given period');
      }

      this.logger.log('Monthly water consumption data retrieved successfully.');
      return monthlyConsumption.map((record) => ({
        date: record.date,
        volume: record.volume,
      }));
    } catch (err) {
      this.logger.log('Error while fetching monthly water consumption: ' + err);
      throw new BadRequestError('Failed to fetch monthly water consumption');
    }
  }
}

export default WaterService;
