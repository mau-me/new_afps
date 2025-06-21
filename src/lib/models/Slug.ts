import mongoose from 'mongoose';

export interface ISlug extends mongoose.Document {
  slug: string;
  associationId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const slugSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    associationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Association',
      required: true,
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

export default mongoose.models.Slug ||
  mongoose.model<ISlug>('Slug', slugSchema);
