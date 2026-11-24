import mongoose from 'mongoose';

/**
 * CPFs liberados pela comissão para criar conta no sistema.
 * O CPF é sempre armazenado apenas com dígitos.
 */
export interface IAllowedUser extends mongoose.Document {
  cpf: string;
  name: string;
  isUsed: boolean;
  usedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const allowedUserSchema = new mongoose.Schema<IAllowedUser>(
  {
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      unique: true,
      match: [/^\d{11}$/, 'CPF deve conter 11 dígitos'],
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
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const AllowedUser: mongoose.Model<IAllowedUser> =
  mongoose.models.AllowedUser ||
  mongoose.model<IAllowedUser>('AllowedUser', allowedUserSchema);

export default AllowedUser;
