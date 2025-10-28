import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotationItem {
  name: string;
  description?: string;
  unitPacking?: string; // e.g., "1 Than", "1 Roll"
  quantity: number; // used for totals if needed
  rateIncludingGST: number; // per unit packing
  mrp?: number; // optional display column
  total: number;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  referenceLetter?: string; // e.g., reference in header
  quotationDate: Date;
  toName: string;
  toDesignation?: string;
  toDepartment?: string;
  toAddress?: string;
  subject?: string;
  items: IQuotationItem[];
  subtotal: number; // sum of item totals
  notes?: string; // closing notes like Thank you text
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

const QuotationItemSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  unitPacking: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  rateIncludingGST: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const QuotationSchema: Schema = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true, trim: true },
    referenceLetter: { type: String, trim: true },
    quotationDate: { type: Date, required: true, default: () => new Date() },
    toName: { type: String, required: true, trim: true },
    toDesignation: { type: String, trim: true },
    toDepartment: { type: String, trim: true },
    toAddress: { type: String, trim: true },
    subject: { type: String, trim: true },
    items: [QuotationItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    userId: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Quotation =
  (mongoose.models.Quotation as mongoose.Model<IQuotation>) ||
  mongoose.model<IQuotation>('Quotation', QuotationSchema);


