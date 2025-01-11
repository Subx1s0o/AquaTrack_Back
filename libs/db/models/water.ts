import { Schema, model, Document, Types } from 'mongoose';

export interface IWater extends Document {
  _id: string;
  date: string;
  amount: number;
  userId: string;
  percentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}
const waterSchema = new Schema<IWater>(
  {
    date: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const WaterModel = model<IWater>('Water', waterSchema);
