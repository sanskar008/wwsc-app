import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  unitPacking?: string; // e.g., "1 Than", "1 Roll", "Per Box"
  hsnCode?: string;
  gstRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'General'
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    unitPacking: {
      type: String,
      trim: true
    },
    hsnCode: {
      type: String,
      trim: true
    },
    gstRate: {
      type: Number,
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

ItemSchema.index({ name: 1, category: 1 });

export const Item =
  (mongoose.models.Item as mongoose.Model<IItem>) ||
  mongoose.model<IItem>('Item', ItemSchema);

