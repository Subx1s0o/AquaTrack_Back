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
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatarURL: {
      type: String,
      required: false,
      default:
        'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'
    },
    weight: {
      type: Number,
      required: true
    },
    activeTime: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female']
    },
    dailyNorm: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const UserModel = model<IUser>('users', userSchema);
