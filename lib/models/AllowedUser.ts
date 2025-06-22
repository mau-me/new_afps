import mongoose from 'mongoose';

export interface IAllowedUser extends mongoose.Document {
  cpf: string;
  name: string;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const allowedUserSchema = new mongoose.Schema(
  {
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AllowedUser ||
  mongoose.model<IAllowedUser>('AllowedUser', allowedUserSchema);
