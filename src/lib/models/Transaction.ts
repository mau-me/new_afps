import mongoose from 'mongoose';

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
  /** Quem registrou a transação (auditoria / prestação de contas). */
  createdBy: mongoose.Types.ObjectId;
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

transactionSchema.index({ date: -1 });

const Transaction: mongoose.Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
