import mongoose from 'mongoose';

export const MONTHLY_STATUSES = ['pago', 'em_aberto'] as const;
export type MonthlyStatus = (typeof MONTHLY_STATUSES)[number];

/**
 * Mensalidade de um jogador.
 * "Vencido" não é armazenado: é derivado de `status === 'em_aberto'` e
 * `dueDate` no passado (ver `overdueFilter`), para nunca ficar desatualizado.
 */
export interface IMonthly extends mongoose.Document {
  playerId: mongoose.Types.ObjectId;
  /** Valor em centavos (inteiro) para evitar erros de ponto flutuante. */
  amountCents: number;
  /** Formato YYYY-MM */
  referenceMonth: string;
  status: MonthlyStatus;
  paymentDate?: Date;
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const monthlySchema = new mongoose.Schema<IMonthly>(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
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
    referenceMonth: {
      type: String,
      required: [true, 'Mês de referência é obrigatório'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Mês de referência deve ser YYYY-MM'],
    },
    status: {
      type: String,
      enum: MONTHLY_STATUSES,
      default: 'em_aberto',
    },
    paymentDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: [true, 'Data de vencimento é obrigatória'],
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

// Uma mensalidade por jogador por mês.
monthlySchema.index({ playerId: 1, referenceMonth: 1 }, { unique: true });

export function overdueFilter(now = new Date()) {
  return { status: 'em_aberto' as const, dueDate: { $lt: now } };
}

const Monthly: mongoose.Model<IMonthly> =
  mongoose.models.Monthly || mongoose.model<IMonthly>('Monthly', monthlySchema);

export default Monthly;
