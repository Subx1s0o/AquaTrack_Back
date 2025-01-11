import { Service } from 'typedi';
import { Logger } from '@/libs/global';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
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

  async addWaterConsumption(body: AddWaterDTO, userId: string): Promise<Omit<IWater, 'userId'>> {
    this.logger.log('Adding water consumption record: ' + JSON.stringify(body));

    const { volume, date } = body;

    const waterRecord = await this.waterRepository.create({
      userId: new Types.ObjectId(userId),
      volume,
      date,
    });

    this.logger.log('Water consumption record added successfully.');

    const { userId: _, ...recordWithoutUserId } = waterRecord.toObject();
    return recordWithoutUserId;
  }

  async editWaterConsumptionPartial(
    body: Partial<EditWaterDTO>, 
    waterId: string, 
    userId: string
  ): Promise<IWater | null> {
    this.logger.log('Editing water consumption record with partial update: ' + JSON.stringify(body));

    const existingRecord = await this.waterRepository.findOne({ _id: waterId });
    if (!existingRecord) {
      throw new NotFoundError('Record not found for the given waterId');
    }

    if (existingRecord.userId.toString() !== userId) {
      throw new Error('You can only edit your own records');
    }

    const updateFields: Partial<IWater> = {};
    if (body.date) updateFields.date = body.date;
    if (body.volume) updateFields.volume = body.volume;

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError('No valid fields provided for update');
    }

    const updatedRecord = await this.waterRepository.updateOne(
      { _id: waterId, userId }, 
      updateFields
    );

    if (!updatedRecord) {
      throw new NotFoundError('Failed to update the water consumption record');
    }

    this.logger.log('Water consumption record updated successfully.');
    return updatedRecord;
  }

  async deleteWaterConsumption(waterId: string, userId: string): Promise<{ message: string }> {
    this.logger.log('Deleting water consumption record: ' + waterId);

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
  }

  async getDailyWaterConsumption(yearMonthDay: string, userId: string): Promise<object[]> {
    this.logger.log('Fetching daily water consumption for date: ' + yearMonthDay);

    const formattedDate = new Date(yearMonthDay).toISOString().split('T')[0]; 

    const dailyConsumption = await this.waterRepository.findAll({ userId });

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
  }

  async getMonthlyWaterConsumption(yearMonth: string, userId: string): Promise<object[]> {
    this.logger.log('Fetching monthly water consumption for yearMonth: ' + yearMonth);

    const [year, month] = yearMonth.split('-');
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${parseInt(month) + 1}-01`);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCDate(endDate.getUTCDate() - 1);

    this.logger.log('Start date: ' + startDate);
    this.logger.log('End date: ' + endDate);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const monthlyConsumption = await this.waterRepository.findAll({
      userId,
      date: { $gte: startDateString, $lte: endDateString }
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
      const currentDateString = currentDate.toISOString().split('T')[0];
      const dailyRecords = monthlyConsumption.filter((record) => {
        const recordDateString = new Date(record.date).toISOString().split('T')[0];
        return recordDateString === currentDateString;
      });

      const dailyTotalVolume = dailyRecords.reduce((total, record) => total + record.volume, 0);
      const percentageConsumed = dailyNorm > 0 ? (dailyTotalVolume / dailyNorm) * 100 : 0;

      consumptionStats.push({
        date: currentDateString,
        percentageConsumed: percentageConsumed.toFixed(2), 
      });
    }

    this.logger.log('Monthly water consumption data retrieved successfully.');
    return consumptionStats;
  }
}

export default WaterService;
