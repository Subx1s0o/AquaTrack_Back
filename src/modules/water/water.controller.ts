import { Controller, Post, Body, Get, HttpCode, Authorized,  Req, Param, Patch, Delete  } from 'routing-controllers';
import { Request } from 'express';
import { Service } from 'typedi';
import WaterService from './water.service';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
import { IWater } from '@/libs/db/models/water';

@Service()
@Controller('/water')
class WaterController {
  constructor(private readonly waterConsumptionService: WaterService) {}

  @Post('/add')
  @HttpCode(201)
  @Authorized()
  async addWaterConsumption(
    @Body() body: AddWaterDTO,
    @Req() req: Request & { userId: string } 
  ): Promise<IWater> {
    const userId = req.userId;
  
    const result = await this.waterConsumptionService.addWaterConsumption(body, userId);
    
    return result;
  }



  @Patch('/:waterId')
  @HttpCode(200)
  @Authorized()
  async editWaterRecord(
    @Param('waterId') waterId: string,
    @Body() body: Partial<EditWaterDTO>,
    @Req() req: Request & { userId: string }
  ): Promise<IWater | null> {
    return await this.waterConsumptionService.editWaterConsumptionPartial(body, waterId, req.userId);
  }


  @Delete('/:waterId')
  @HttpCode(204)
  @Authorized()
  async deleteWaterRecord(
    @Param('waterId') waterId: string,
    @Req() req: Request & { userId: string }
  ): Promise<{ message: string }> {
    return await this.waterConsumptionService.deleteWaterConsumption(waterId, req.userId);
  }

  
  @Get('/daily/:yearMonthDay')
  @HttpCode(200)
  @Authorized()
  async getDailyWaterConsumption(
    @Param('yearMonthDay') yearMonthDay: string, 
    @Req() req: Request & { userId: string } 
  ): Promise<object[]> {
    const userId = req.userId; 
  
    const result = await this.waterConsumptionService.getDailyWaterConsumption(yearMonthDay, userId);
    return result;
  }

  @Get('/monthly/:yearMonth')
  @HttpCode(200)
  @Authorized()
  async getMonthlyWaterConsumption(
    @Param('yearMonth') yearMonth: string, 
    @Req() req: Request & { userId: string }
  ): Promise<object[]> {
    const userId = req.userId;
  
    // Передаємо yearMonth та userId без поділу
    const result = await this.waterConsumptionService.getMonthlyWaterConsumption(yearMonth, userId);
    
    return result;
  }
}

export default WaterController;
