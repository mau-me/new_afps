import mongoose from 'mongoose';
import { defineModel } from './define-model';

/** Dados institucionais da associação (documento único). */
export interface IAssociation extends mongoose.Document {
  name: string;
  description: string;
  foundedDate: Date;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  commission: string[];
  gameSchedule: string;
  /** Valor único da mensalidade, em centavos. 0 = ainda não configurado. */
  monthlyFeeCents: number;
  /** Dia do mês em que a mensalidade vence (1 a 28, vale para todo mês). */
  dueDay: number;
  /** Valores padrão das multas por cartão, em centavos (0 = sem padrão). */
  yellowCardFeeCents: number;
  redCardFeeCents: number;
  createdAt: Date;
  updatedAt: Date;
}

const associationSchema = new mongoose.Schema<IAssociation>(
  {
    name: {
      type: String,
      required: [true, 'Nome da associação é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
    },
    foundedDate: {
      type: Date,
      required: [true, 'Data de fundação é obrigatória'],
    },
    address: {
      type: String,
      required: [true, 'Endereço é obrigatório'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    commission: [String],
    gameSchedule: {
      type: String,
      default: 'Domingos pela manhã',
    },
    monthlyFeeCents: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Valor deve ser um inteiro em centavos',
      },
    },
    dueDay: {
      type: Number,
      default: 10,
      min: 1,
      max: 28,
    },
    yellowCardFeeCents: {
      type: Number,
      default: 0,
      min: 0,
    },
    redCardFeeCents: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Association = defineModel<IAssociation>('Association', associationSchema);

export default Association;
