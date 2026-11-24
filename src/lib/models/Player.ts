import mongoose from 'mongoose';
import { defineModel } from './define-model';
import { PLAYER_POSITIONS } from '@/lib/validation';

export { PLAYER_POSITIONS };
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export interface IPlayer extends mongoose.Document {
  /** Conta vinculada; preenchida quando o jogador se cadastra com o mesmo CPF. */
  userId?: mongoose.Types.ObjectId;
  cpf: string;
  fullName: string;
  nickname: string;
  position: PlayerPosition;
  shirtNumber: number;
  birthDate: Date;
  phone: string;
  address: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new mongoose.Schema<IPlayer>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      unique: true,
      match: [/^\d{11}$/, 'CPF deve conter 11 dígitos'],
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
      enum: PLAYER_POSITIONS,
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

const Player = defineModel<IPlayer>('Player', playerSchema);

export default Player;
