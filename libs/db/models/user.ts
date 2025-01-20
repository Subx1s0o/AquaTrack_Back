import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  avatarURL: string;
  weight: number;
  activeTime: number;
  gender: 'male' | 'female' | 'other';
  dailyNorm: number;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false,
      default: 'User'
    },
    avatarURL: {
      type: String,
      required: false,
      default: null
    },
    weight: {
      type: Number,
      required: false
    },
    activeTime: {
      type: Number,
      required: false
    },
    gender: {
      type: String,
      required: false,
      enum: ['male', 'female', 'other'],
      default: 'other'
    },
    dailyNorm: {
      type: Number,
      required: false,
      default: 1500
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const UserModel = model<IUser>('users', userSchema);
export type IWaterPlain = Omit<IUser, keyof Document>;
