import { Schema, model, Document, Types } from 'mongoose';

export interface IWater extends Document {
  _id: string;
  date: string;
  volume: number;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const waterSchema = new Schema<IWater>(
  {
    date: {
      type: String,
      required: true
    },
    volume: {
      type: Number,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const WaterModel = model<IWater>('Water', waterSchema);
