import { Logger } from './logger';
import { FilterQuery } from 'mongoose';

export class CrudLogger<EntityType, DataType> extends Logger {
  constructor() {
    super();
  }

  logCreate(entity: EntityType, data: DataType): void {
    const message = `Creating ${JSON.stringify(entity)} with data: ${JSON.stringify(data)}`;
    this.log(message);
  }

  logRead(entity: EntityType, filter: FilterQuery<EntityType>): void {
    const message = `Reading ${JSON.stringify(entity)} with filter: ${JSON.stringify(filter)}`;
    this.log(message);
  }

  logUpdate(
    entity: EntityType,
    filter: FilterQuery<EntityType>,
    updatedData: DataType
  ): void {
    const message = `Updating ${JSON.stringify(entity)} with filter: ${JSON.stringify(filter)}, new data: ${JSON.stringify(updatedData)}`;
    this.log(message);
  }

  logDelete(entity: EntityType, filter: FilterQuery<EntityType>): void {
    const message = `Deleting ${JSON.stringify(entity)} with filter: ${JSON.stringify(filter)}`;
    this.log(message);
  }

  logError(message: string): void {
    this.error(message);
  }
}
