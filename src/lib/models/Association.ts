import mongoose from 'mongoose';

export interface IAssociation extends mongoose.Document {
  name: string;
  description: string;
  foundedDate: Date;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  commission: string[];
  totalPlayers: number;
  gameSchedule: string;
  createdAt: Date;
  updatedAt: Date;
}

const associationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome da associação é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
    },
    foundedDate: {
      type: Date,
      required: [true, 'Data de fundação é obrigatória'],
    },
    address: {
      type: String,
      required: [true, 'Endereço é obrigatório'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    commission: [String],
    totalPlayers: {
      type: Number,
      default: 0,
    },
    gameSchedule: {
      type: String,
      default: 'Domingos pela manhã',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Association ||
  mongoose.model<IAssociation>('Association', associationSchema);
