import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  Authorized,
  Req,
  Param,
  Patch,
  Delete
} from 'routing-controllers';
import { Request } from 'express';
import { Service } from 'typedi';
import WaterService from './water.service';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';

import { IWaterConsumption } from 'types/WaterConsumption';

@Service()
@Controller('/water')
class WaterController {
  constructor(private readonly waterConsumptionService: WaterService) {}

  @Post('/')
  @HttpCode(201)
  @Authorized()
  async addWaterConsumption(
    @Body() body: AddWaterDTO,
    @Req() req: Request & { userId: string }
  ): Promise<Omit<IWaterConsumption, 'userId'>> {
    const userId = req.userId;

    const result = await this.waterConsumptionService.addWaterConsumption(
      body,
      userId
    );

    return result;
  }

  @Patch('/:waterId')
  @HttpCode(200)
  @Authorized()
  async editWaterRecord(
    @Param('waterId') waterId: string,
    @Body() body: Partial<EditWaterDTO>,
    @Req() req: Request & { userId: string }
  ): Promise<Omit<IWaterConsumption, 'userId'> | null> {
    return await this.waterConsumptionService.editWaterConsumptionPartial(
      body,
      waterId,
      req.userId
    );
  }

  @Delete('/:waterId')
  @HttpCode(204)
  @Authorized()
  async deleteWaterRecord(
    @Param('waterId') waterId: string,
    @Req() req: Request & { userId: string }
  ): Promise<void> {
    return await this.waterConsumptionService.deleteWaterConsumption(
      waterId,
      req.userId
    );
  }

  @Get('/daily/:date')
  @HttpCode(200)
  @Authorized()
  async getDailyWaterConsumption(
    @Param('date') date: string,
    @Req() req: Request & { userId: string }
  ): Promise<IWaterConsumption[]> {
    return await this.waterConsumptionService.getDailyWaterConsumption(
      date,
      req.userId
    );
  }

  // @Get('/:yearMonth')
  // @HttpCode(200)
  // @Authorized()
  // async getMonthlyWaterConsumption(
  //   @Param('yearMonth') yearMonth: string,
  //   @Req() req: Request & { userId: string }
  // ): Promise<Omit<'userId', IWater>> {
  //   return await this.waterConsumptionService.getMonthlyWaterConsumption(
  //     yearMonth,
  //     req.userId
  //   );
  // }
}

export default WaterController;
