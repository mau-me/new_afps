import mongoose from 'mongoose';

export interface IPlayer extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  nickname: string;
  position: string;
  shirtNumber: number;
  birthDate: Date;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Nome completo é obrigatório'],
      trim: true,
    },
    nickname: {
      type: String,
      required: [true, 'Apelido é obrigatório'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Posição é obrigatória'],
      enum: ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'],
    },
    shirtNumber: {
      type: Number,
      required: [true, 'Número da camisa é obrigatório'],
      min: 1,
      max: 99,
    },
    birthDate: {
      type: Date,
      required: [true, 'Data de nascimento é obrigatória'],
    },
    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Endereço é obrigatório'],
      trim: true,
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

export default mongoose.models.Player ||
  mongoose.model<IPlayer>('Player', playerSchema);
