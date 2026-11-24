import mongoose from 'mongoose';
import { defineModel } from './define-model';

export const CARD_STATUSES = ['pendente', 'pago'] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

/** Multa por cartão (amarelo/vermelho) aplicada a um jogador. */
export interface ICard extends mongoose.Document {
  playerId: mongoose.Types.ObjectId;
  description: string;
  /** Valor em centavos (inteiro). */
  amountCents: number;
  date: Date;
  status: CardStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new mongoose.Schema<ICard>(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
    },
    amountCents: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Valor deve ser um inteiro em centavos',
      },
    },
    date: {
      type: Date,
      required: [true, 'Data é obrigatória'],
    },
    status: {
      type: String,
      enum: CARD_STATUSES,
      default: 'pendente',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Card = defineModel<ICard>('Card', cardSchema);

export default Card;
