import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Logger } from '@/global';
import createHttpError from 'http-errors';

export abstract class AbstractRepository<TDocument extends Document> {
  constructor(
    protected model: Model<TDocument>,
    private readonly logger: Logger
  ) {}

  // Створення нового документа
  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    try {
      const createdDocument = new this.model(document);
      this.logger.log(`Created document: ${JSON.stringify(createdDocument)}`);
      return await createdDocument.save();
    } catch (error) {
      this.logger.error(`Error creating document: ${error}`);
      throw createHttpError(400, `Error creating document`);
    }
  }

  // Отримання документа за ідентифікатором
  async findOne(filter: FilterQuery<TDocument>): Promise<TDocument | null> {
    const document = await this.model.findOne(filter).lean().exec();
    if (!document) {
      this.logger.error(`Document with ${filter}: ${filter} not found.`);
      throw createHttpError(
        404,
        `Document with ${filter}: ${filter} not found.`
      );
    }
    this.logger.log(`Found document by ${filter}: ${JSON.stringify(document)}`);
    return document as TDocument;
  }

  // Оновлення документа за фільтром
  async findOneAndUpdate(
    filter: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<TDocument | null> {
    const updatedDocument = await this.model
      .findOneAndUpdate(filter, update, { new: true })
      .lean()
      .exec();

    if (!updatedDocument) {
      this.logger.warn(
        `Document with ${filter}: ${filter} not found for update.`
      );
      throw createHttpError(404, `Document not found for update.`);
    }

    this.logger.log(`Updated document: ${JSON.stringify(updatedDocument)}`);
    return updatedDocument as TDocument;
  }

  // Отримання всіх документів
  async find(filter: FilterQuery<TDocument>): Promise<TDocument[]> {
    const documents = await this.model.find(filter).lean().exec();
    this.logger.log(`Found documents with filter ${JSON.stringify(filter)}`);
    return documents as TDocument[];
  }

  // Видалення документа за ідентифікатором
  async findOneAndDelete(
    filter: FilterQuery<TDocument>
  ): Promise<TDocument | null> {
    const result = await this.model.findOneAndDelete(filter).lean().exec();
    if (result) {
      this.logger.log(
        `Document with ${filter}: ${filter} deleted successfully.`
      );
    } else {
      this.logger.warn(
        `Document with ${filter}: ${filter} not found for deletion.`
      );
      throw createHttpError(
        404,
        `Document with ${filter}: ${filter} not found for deletion.`
      );
    }
    return result as TDocument;
  }
}
