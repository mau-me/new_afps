import mongoose from 'mongoose';

export interface ITransaction extends mongoose.Document {
  type: 'entrada' | 'saida';
  category: string;
  amount: number;
  date: Date;
  description: string;
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['entrada', 'saida'],
      required: [true, 'Tipo é obrigatório'],
    },
    category: {
      type: String,
      required: [true, 'Categoria é obrigatória'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: 0,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', transactionSchema);
