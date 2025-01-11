import { Service } from 'typedi';

import { AddWaterDTO, EditWaterDTO } from './dto';
import { WaterRepository } from '@/repositories/water.repository';
import { IWater } from '@/libs/db/models/water';
import { BadRequestError, NotFoundError } from 'routing-controllers';
import { UserRepository } from '@/repositories/user.repository';
import { IWaterConsumption } from 'types/WaterConsumption';

@Service()
class WaterService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly waterRepository: WaterRepository
  ) {}

  private async checkRecordExists(
    waterId: string,
    userId: string
  ): Promise<IWater> {
    const existingRecord = await this.waterRepository.findOne({
      _id: waterId,
      userId
    });
    if (!existingRecord) {
      throw new NotFoundError('Record not found for the given waterId');
    }
    return existingRecord;
  }

  async addWaterConsumption(
    body: AddWaterDTO,
    userId: string
  ): Promise<Omit<IWaterConsumption, 'userId'>> {
    const { amount, date, dailyNorm } = body;
    const percentage = (amount / dailyNorm) * 100;
    const waterRecord = await this.waterRepository.create({
      userId,
      amount,
      date,
      percentage: +percentage.toFixed()
    });

    const { userId: _, ...recordWithoutUserId } = waterRecord;

    return recordWithoutUserId;
  }

  async editWaterConsumptionPartial(
    body: Partial<EditWaterDTO>,
    waterId: string,
    userId: string
  ): Promise<Omit<IWaterConsumption, 'userId'> | null> {
    const existingRecord = await this.checkRecordExists(waterId, userId);
    const updateFields: Partial<Omit<IWater, 'userId'>> = {};

    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        const typedKey = key as keyof EditWaterDTO;

        if (typedKey in existingRecord) {
          updateFields[typedKey as keyof Omit<IWater, 'userId'>] = body[
            typedKey
          ] as IWater[keyof IWater];
        }
      }
    }

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

    return updatedRecord;
  }

  async deleteWaterConsumption(waterId: string, userId: string): Promise<void> {
    const existingRecord = await this.checkRecordExists(waterId, userId);
    if (existingRecord.userId.toString() !== userId) {
      throw new BadRequestError('You can only delete your own records');
    }

    return await this.waterRepository.deleteOne({ _id: waterId, userId });
  }

  async getDailyWaterConsumption(
    date: string,
    userId: string
  ): Promise<IWaterConsumption[]> {
    const dailyConsumption = await this.waterRepository.findAll({
      userId,
      date
    });

    if (!dailyConsumption) {
      throw new NotFoundError(
        'No daily water consumption found for the given date'
      );
    }

    const filteredRecords = dailyConsumption.filter((record) => {
      return record.date === date;
    });

    const totalPercentage = filteredRecords.reduce(
      (total, record) => total + record.percentage,
      0
    );

    return filteredRecords.map((record) => ({
      _id: record._id,
      date: record.date,
      amount: record.amount,
      percentage: totalPercentage
    }));
  }

  // async getMonthlyWaterConsumption(
  //   yearMonth: string,
  //   userId: string
  // ): Promise<object[]> {
  //   const [year, month] = yearMonth.split('-');
  //   const startDate = new Date(`${year}-${month}-01`);
  //   const endDate = new Date(`${year}-${parseInt(month) + 1}-01`);

  //   startDate.setUTCHours(0, 0, 0, 0);
  //   endDate.setUTCHours(0, 0, 0, 0);
  //   endDate.setUTCDate(endDate.getUTCDate() - 1);

  //   const startDateString = startDate.toISOString().split('T')[0];
  //   const endDateString = endDate.toISOString().split('T')[0];

  //   const monthlyConsumption = await this.waterRepository.findAll({
  //     userId,
  //     date: { $gte: startDateString, $lte: endDateString }
  //   });

  //   if (monthlyConsumption.length === 0) {
  //     throw new NotFoundError(
  //       'No monthly water consumption found for the given period'
  //     );
  //   }

  //   const user = await this.userRepository.findOne({ _id: userId });
  //   if (!user) {
  //     throw new NotFoundError('User not found');
  //   }

  //   const dailyNorm = user.dailyNorm;
  //   const consumptionStats = [];

  //   for (let day = 1; day <= 31; day++) {
  //     const currentDate = new Date(`${year}-${month}-${day}`);
  //     if (currentDate.getMonth() + 1 !== parseInt(month)) continue;
  //     const currentDateString = currentDate.toISOString().split('T')[0];
  //     const dailyRecords = monthlyConsumption.filter((record) => {
  //       const recordDateString = new Date(record.date)
  //         .toISOString()
  //         .split('T')[0];
  //       return recordDateString === currentDateString;
  //     });

  //     const dailyTotalVolume = dailyRecords.reduce(
  //       (total, record) => total + record.volume,
  //       0
  //     );
  //     const percentageConsumed =
  //       dailyNorm > 0 ? (dailyTotalVolume / dailyNorm) * 100 : 0;

  //     consumptionStats.push({
  //       date: currentDateString,
  //       percentageConsumed: percentageConsumed.toFixed(2)
  //     });
  //   }

  //   return consumptionStats;
  // }
}

export default WaterService;
