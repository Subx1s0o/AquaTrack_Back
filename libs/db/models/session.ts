import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  _id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const SessionModel = model<ISession>('sessions', sessionSchema);
