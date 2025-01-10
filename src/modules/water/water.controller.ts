import { Controller, Post, Body, Get, HttpCode, Authorized, CurrentUser } from 'routing-controllers';
import { Service } from 'typedi';
import WaterService from './water.service';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
import { DeleteWaterDTO } from './dto/deleteWater';
import { GetDailyWaterDTO } from './dto/getDailyWater';
import { GetMonthlyWaterDTO } from './dto/getMonthlyWater';
import { IWater } from '@/libs/db/models/water';
import { IUser } from '@/libs/db/models/user'; 

@Service()
@Controller('/water')
class WaterController {
  constructor(private readonly waterConsumptionService: WaterService) {}

  @Post('/add')
  @HttpCode(201)
  @Authorized()  
  async addWaterConsumption(
    @Body() body: AddWaterDTO,
    @CurrentUser({required: true}) user: IUser 
  ): Promise<IWater> {
    
    const result = await this.waterConsumptionService.addWaterConsumption({
      ...body,
      userId: user._id, 
    });
    return result;
  }


  @Post('/edit')
  @HttpCode(200)
  @Authorized() 
  async editWaterConsumption(
    @Body() body: EditWaterDTO,
    @CurrentUser({required: true}) user: IUser 
  ): Promise<IWater | null> {
    if (body.userId.toString() !== user._id.toString()) {
      throw new Error('You cannot edit records that do not belong to you.');
    }

    const result = await this.waterConsumptionService.editWaterConsumption(body);
    return result;
  }


  @Post('/delete')
  @HttpCode(200)
  @Authorized() 
  async deleteWaterConsumption(
    @Body() body: DeleteWaterDTO,
    @CurrentUser({required: true}) user: IUser 
  ): Promise<{ message: string }> {
    if (body.userId.toString() !== user._id.toString()) {
      throw new Error('You cannot delete records that do not belong to you.');
    }

    const result = await this.waterConsumptionService.deleteWaterConsumption(body);
    return result;
  }

  
  @Get('/daily')
  @HttpCode(200)
  @Authorized() 
  async getDailyWaterConsumption(
    @Body() body: GetDailyWaterDTO, 
    @CurrentUser({required: true}) user: IUser 
  ): Promise<object[]> {
    body.userId = user._id; 
    const result = await this.waterConsumptionService.getDailyWaterConsumption(body);
    return result;
  }

  @Get('/monthly')
  @HttpCode(200)
  @Authorized() 
  async getMonthlyWaterConsumption(
    @Body() body: GetMonthlyWaterDTO, 
    @CurrentUser({required: true}) user: IUser 
  ): Promise<object[]> {
    body.userId = user._id; 
    const result = await this.waterConsumptionService.getMonthlyWaterConsumption(body);
    return result;
  }
}

export default WaterController;
