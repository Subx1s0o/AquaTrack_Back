import { Controller, Post, Body, Get, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import WaterService from './water.service';
import { AddWaterDTO } from './dto/addWater';
import { EditWaterDTO } from './dto/editWater';
import { DeleteWaterDTO } from './dto/deleteWater';
import { GetDailyWaterDTO } from './dto/getDailyWater';
import { GetMonthlyWaterDTO } from './dto/getMonthlyWater';

@Service()
@Controller('/water')
class WaterController {
  constructor(private readonly waterConsumptionService: WaterService) {}

  @Post('/add')
  @HttpCode(201)
  async addWaterConsumption(@Body() body: AddWaterDTO) {
    const result = await this.waterConsumptionService.addWaterConsumption(body);
    return result;
  }

  @Post('/edit')
  @HttpCode(200)
  async editWaterConsumption(@Body() body: EditWaterDTO) {
    const result = await this.waterConsumptionService.editWaterConsumption(body);
    return result;
  }

  @Post('/delete')
  @HttpCode(200)
  async deleteWaterConsumption(@Body() body: DeleteWaterDTO) {
    const result = await this.waterConsumptionService.deleteWaterConsumption(body);
    return result;
  }

  @Get('/daily')
  @HttpCode(200)
  async getDailyWaterConsumption() {
    const result = await this.waterConsumptionService.getDailyWaterConsumption();
    return result;
  }

  @Get('/monthly')
  @HttpCode(200)
  async getMonthlyWaterConsumption() {
    const result = await this.waterConsumptionService.getMonthlyWaterConsumption();
    return result;
  }
}

export default WaterController;
