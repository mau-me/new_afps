import mongoose from 'mongoose';
import { defineModel } from './define-model';
import bcrypt from 'bcryptjs';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation';

export const USER_ROLES = ['comissao', 'jogador'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: PASSWORD_MIN_LENGTH,
      select: false,
    },
    // Apenas dígitos. Opcional para contas administrativas criadas pelo seed.
    cpf: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\d{11}$/, 'CPF deve conter 11 dígitos'],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'jogador',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error as mongoose.Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = defineModel<IUser>('User', userSchema);

export default User;
