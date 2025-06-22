import mongoose from 'mongoose';

export interface ICard extends mongoose.Document {
  playerId: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  date: Date;
  status: 'pendente' | 'pago';
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: 0,
    },
    date: {
      type: Date,
      required: [true, 'Data é obrigatória'],
    },
    status: {
      type: String,
      enum: ['pendente', 'pago'],
      default: 'pendente',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Card ||
  mongoose.model<ICard>('Card', cardSchema);
