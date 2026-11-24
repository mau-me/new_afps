import mongoose from 'mongoose';
import { defineModel } from './define-model';

export const TRANSACTION_TYPES = ['entrada', 'saida'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface ITransaction extends mongoose.Document {
  type: TransactionType;
  category: string;
  /** Valor em centavos (inteiro). */
  amountCents: number;
  date: Date;
  description: string;
  receipt?: string;
  /** Mensalidade que originou esta entrada, se houver. */
  monthlyId?: mongoose.Types.ObjectId;
  /** Cartão (multa) que originou esta entrada, se houver. */
  cardId?: mongoose.Types.ObjectId;
  /** Quem registrou a transação (auditoria / prestação de contas). */
  createdBy: mongoose.Types.ObjectId;
  /** Exclusão lógica: o lançamento some do caixa, mas fica no banco. */
  deletedAt?: Date | null;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: [true, 'Tipo é obrigatório'],
    },
    category: {
      type: String,
      required: [true, 'Categoria é obrigatória'],
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
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
    },
    receipt: {
      type: String,
      trim: true,
    },
    monthlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monthly',
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ deletedAt: 1, date: -1 });
transactionSchema.index({ monthlyId: 1 });
transactionSchema.index({ cardId: 1 });

/** Filtro de lançamentos ativos (não excluídos). Use em toda consulta. */
export const activeFilter = { deletedAt: null } as const;

const Transaction = defineModel<ITransaction>('Transaction', transactionSchema);

export default Transaction;
