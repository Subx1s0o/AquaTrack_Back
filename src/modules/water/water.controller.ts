import {
  Post,
  Body,
  Get,
  HttpCode,
  Authorized,
  Req,
  Param,
  Patch,
  Delete,
  JsonController
} from 'routing-controllers';
import { Request } from 'express';
import { Service } from 'typedi';
import WaterService from './water.service';

import { IWaterConsumption } from 'types/WaterConsumption';
import { AddWaterDTO, EditWaterDTO } from './dto';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Service()
@JsonController('/water')
class WaterController {
  constructor(private readonly waterConsumptionService: WaterService) {}

  @Post('/')
  @HttpCode(201)
  @Authorized()
  @OpenAPI({
    summary: 'Add water consumption record',
    description: 'Adds a new water consumption record for user.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AddWaterDTO' },
        },
      },
    },
    responses: {
      '201': {
        description: 'Water consumption record added successfully.',
      },
    },
  })
  @ResponseSchema(AddWaterDTO)
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
  @Authorized()
  @OpenAPI({
    summary: 'Edit water consumption record',
    description: 'Edits a specific water consumption record for user.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'waterId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID of the water record to edit.',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/EditWaterDTO' },
        },
      },
    },
    responses: {
      '200': {
        description: 'Water consumption record updated successfully.',
      },
    },
  })
  @ResponseSchema(EditWaterDTO)
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
  @OpenAPI({
    summary: 'Delete water consumption record',
    description: 'Deletes a specific water consumption record for user.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'waterId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID of the water record to delete.',
      },
    ],
    responses: {
      '204': { description: 'Water consumption record deleted successfully.' },
    },
  })
  async deleteWaterRecord(
    @Param('waterId') waterId: string,
    @Req() req: Request & { userId: string }
  ): Promise<void> {
    return await this.waterConsumptionService.deleteWaterConsumption(
      waterId,
      req.userId
    );
  }

  @Get('/day/:date')
  @Authorized()
  @OpenAPI({
    summary: 'Get daily water consumption',
    description: 'Get all water consumption records for a specific date for user.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'date',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'date' },
        description: 'The date for which to fetch records (YYYY-MM-DD).',
      },
    ],
    responses: {
      '200': {
        description: 'Daily water consumption fetched successfully.',
      },
    },
  })
  async getDailyWaterConsumption(
    @Param('date') date: string,
    @Req() req: Request & { userId: string }
  ): Promise<{ records: IWaterConsumption[]; totalPercentage: number }> {
    return await this.waterConsumptionService.getDailyWaterConsumption(
      date,
      req.userId
    );
  }

  @Get('/month/:date')
  @Authorized()
  @OpenAPI({
    summary: 'Get monthly water consumption',
    description: 'Get all water consumption records for a specific month for user.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'date',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'date' },
        description: 'The month for which to fetch records (YYYY-MM).',
      },
    ],
    responses: {
      '200': {
        description: 'Monthly water consumption fetched successfully.',
      },
    },
  })
  async getMonthlyWaterConsumption(
    @Param('date') date: string,
    @Req() req: Request & { userId: string }
  ): Promise<{ records: IWaterConsumption[]; totalPercentage: number }> {
    return await this.waterConsumptionService.getMonthlyWaterConsumption(
      date,
      req.userId
    );
  }
}

export default WaterController;
