import { Service } from 'typedi';

import { AddWaterDTO, EditWaterDTO } from './dto';
import { WaterRepository } from '@/modules/water/water.repository';

import { IWaterConsumption } from 'types/WaterConsumption';
import { WaterConsumptionHelper } from './helpers/water-consumption.helper';
import { UserRepository } from '../users/user.repository';
@Service()
class WaterService {
  constructor(
    private readonly waterRepository: WaterRepository,
    private readonly waterConsumptionHelper: WaterConsumptionHelper,
    private readonly userRepository: UserRepository
  ) {}

  async addWaterConsumption(
    body: AddWaterDTO,
    userId: string
  ): Promise<Omit<IWaterConsumption, 'userId'>> {
    const { amount, date, dailyNorm, time } = body;
    const percentage = +((amount / dailyNorm) * 100).toFixed();
    const waterRecord = await this.waterRepository.create({
      userId,
      amount,
      time,
      date
    });

    const { userId: _, ...recordWithoutUserId } = waterRecord;

    return { ...recordWithoutUserId, percentage };
  }

  async editWaterConsumptionPartial(
    body: Partial<EditWaterDTO>,
    waterId: string,
    userId: string
  ): Promise<Omit<IWaterConsumption, 'userId'> | null> {
    const updatedRecord = await this.waterRepository.updateOne(
      { _id: waterId, userId },
      { ...body }
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
  ): Promise<{
    records: IWaterConsumption[];
    totalPercentage: number;
    date: string;
  }> {
    const dailyConsumption = await this.waterRepository.findAll({
      userId,
      date
    });

    const dailyNorm = await this.userRepository
      .findOne({ _id: userId })
      .then((user) => user.dailyNorm);

    if (!dailyConsumption || dailyConsumption.length === 0) {
      return {
        totalPercentage: 0,
        records: [],
        date: date
      };
    }

    const totalAmount = dailyConsumption.reduce(
      (sum, record) => sum + record.amount,
      0
    );

    const totalPercentage = ((totalAmount / dailyNorm) * 100).toFixed(2);

    const consumptionWithPercentage = dailyConsumption.map((record) => ({
      ...record,
      percentage: parseFloat(((record.amount / dailyNorm) * 100).toFixed(2))
    }));

    return {
      totalPercentage: parseFloat(totalPercentage),
      records: consumptionWithPercentage,
      date: date
    };
  }

  async getMonthlyWaterConsumption(
    date: string,
    userId: string
  ): Promise<{ records: IWaterConsumption[]; totalPercentage: number }> {
    this.waterConsumptionHelper.setDate(date);
    const { startOfMonth, endOfMonth, lastDayOfMonth } =
      this.waterConsumptionHelper.getMonthBoundaries();

    const dailyNorm = await this.userRepository
      .findOne({
        _id: userId
      })
      .then((user) => user.dailyNorm);

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

    const groupedByDate = this.waterConsumptionHelper.groupRecords(
      perDay,
      dailyNorm
    );
    const { records, totalPercentage } =
      this.waterConsumptionHelper.generateResult(lastDayOfMonth, groupedByDate);
    return { records, totalPercentage };
  }
}

export default WaterService;
