import { Service } from 'typedi';

import { AddWaterDTO, EditWaterDTO } from './dto';
import { WaterRepository } from '@/repositories/water.repository';
import { IWater } from '@/libs/db/models/water';
import { BadRequestError, NotFoundError } from 'routing-controllers';
import { IWaterConsumption } from 'types/WaterConsumption';
import { WaterConsumptionHelper } from './helpers/water-consumption.helper';
@Service()
class WaterService {
  constructor(
    private readonly waterRepository: WaterRepository,
    private readonly waterConsumptionHelper: WaterConsumptionHelper
  ) {}

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
    const updateFields: Partial<Omit<IWater, 'userId'>> = {};

    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        const typedKey = key as keyof EditWaterDTO;

        if (typedKey in updateFields) {
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
      { ...updateFields }
    );

    return updatedRecord;
  }

  async deleteWaterConsumption(waterId: string, userId: string): Promise<void> {
    await this.waterRepository.deleteOne({
      _id: waterId,
      userId
    });
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

    const filteredRecords = dailyConsumption.filter(
      (record) => record.date === date
    );
    const totalPercentage = filteredRecords
      .reduce((total, record) => total + record.percentage, 0)
      .toFixed();

    return filteredRecords.map((record) => ({
      _id: record._id,
      date: record.date,
      amount: record.amount,
      percentage: +totalPercentage
    }));
  }

  async getMonthlyWaterConsumption(
    date: string,
    userId: string
  ): Promise<IWaterConsumption[]> {
    this.waterConsumptionHelper.setDate(date);
    const { startOfMonth, endOfMonth, lastDayOfMonth } =
      this.waterConsumptionHelper.getMonthBoundaries();

    const perDay = await this.waterRepository.findAll({
      userId,
      date: {
        $gte: startOfMonth.toISOString(),
        $lte: endOfMonth.toISOString()
      }
    });

    if (!perDay || perDay.length === 0) {
      return this.waterConsumptionHelper.createEmptyMonthlyData(lastDayOfMonth);
    }

    const groupedByDate = this.waterConsumptionHelper.groupRecords(perDay);
    return this.waterConsumptionHelper.generateResult(
      lastDayOfMonth,
      groupedByDate
    );
  }
}

export default WaterService;
