import mongoose from 'mongoose';

export interface IMonthly extends mongoose.Document {
  playerId: mongoose.Types.ObjectId;
  amount: number;
  referenceMonth: string;
  status: 'pago' | 'em_aberto' | 'vencido';
  paymentDate?: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const monthlySchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: 0,
    },
    referenceMonth: {
      type: String,
      required: [true, 'Mês de referência é obrigatório'],
    },
    status: {
      type: String,
      enum: ['pago', 'em_aberto', 'vencido'],
      default: 'em_aberto',
    },
    paymentDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: [true, 'Data de vencimento é obrigatória'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Monthly ||
  mongoose.model<IMonthly>('Monthly', monthlySchema);
