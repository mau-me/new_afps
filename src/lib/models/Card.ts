import mongoose from 'mongoose';
import { defineModel } from './define-model';

export const CARD_STATUSES = ['pendente', 'pago'] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const CARD_COLORS = ['amarelo', 'vermelho'] as const;
export type CardColor = (typeof CARD_COLORS)[number];

/** Multa por cartão (amarelo/vermelho) aplicada a um jogador. */
export interface ICard extends mongoose.Document {
  playerId: mongoose.Types.ObjectId;
  color: CardColor;
  /** Contexto opcional, ex.: "Jogo contra o Mar Grande". */
  description: string;
  /** Valor da multa em centavos (inteiro). */
  amountCents: number;
  /** Data em que o cartão foi recebido. */
  date: Date;
  status: CardStatus;
  paymentDate?: Date;
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
    color: {
      type: String,
      enum: CARD_COLORS,
      required: [true, 'Cor do cartão é obrigatória'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
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
    paymentDate: {
      type: Date,
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

cardSchema.index({ playerId: 1, date: -1 });
cardSchema.index({ status: 1, date: -1 });

const Card = defineModel<ICard>('Card', cardSchema);

export default Card;
