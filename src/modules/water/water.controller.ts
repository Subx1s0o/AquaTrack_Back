import { Controller, Post, Body, Get, HttpCode, Authorized,  Req, Param  } from 'routing-controllers';
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



  @Post('/edit/:waterId')
  @HttpCode(200)
  @Authorized()
  async editWaterConsumption(
    @Param('waterId') waterId: string, 
    @Body() body: EditWaterDTO,
    @Req() req: Request & { userId: string } 
  ): Promise<IWater | null> {
    const userId = req.userId; 
  
    const result = await this.waterConsumptionService.editWaterConsumption(body, waterId, userId);
    return result;
  }


  @Post('/delete/:waterId')
  @HttpCode(200)
  @Authorized()
  async deleteWaterConsumption(
    @Param('waterId') waterId: string, 
    @Req() req: Request & { userId: string }
  ): Promise<{ message: string }> {
    const userId = req.userId;
  
    const result = await this.waterConsumptionService.deleteWaterConsumption(waterId, userId);
    return result;
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
  
    const [year, month] = yearMonth.split('-');
  
    const result = await this.waterConsumptionService.getMonthlyWaterConsumption({ year, month, userId });
    return result;
  }
}

export default WaterController;
