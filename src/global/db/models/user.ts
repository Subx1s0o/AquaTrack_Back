import { Schema, model, Document } from 'mongoose';

// Інтерфейс для типізації користувача
export interface IUser extends Document {
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
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      default:""
    },
    avatarURL: {
      type: String,
      required: true,
      default: 'https://cloudinary.com/...', 
    },
    weight: {
      type: Number,
      required: true,
      default: 0,
    },
    activeTime: {
      type: Number,
      required: true,
      default: 0,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female'], 
    },
    dailyNorm: {
      type: Number,
      required: true,
      default: 1500, 
    },
  },
  {
    timestamps: true, 
    versionKey: false, 
  },
);

export const UserModel = model<IUser>('users', userSchema);
