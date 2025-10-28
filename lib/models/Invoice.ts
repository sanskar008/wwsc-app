import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  invoiceType: 'proforma' | 'tax';
  state: string;
  stateCode: string;
  orderNumber?: string;
  orderDate?: Date;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: IInvoiceItem[];
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  transactionType: 'intrastate' | 'interstate';
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

const InvoiceItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  invoiceType: {
    type: String,
    enum: ['proforma', 'tax'],
    default: 'proforma',
    required: true
  },
  state: {
    type: String,
    required: true,
    trim: true,
    default: 'Maharashtra'
  },
  stateCode: {
    type: String,
    required: true,
    trim: true,
    default: '27'
  },
  orderNumber: {
    type: String,
    trim: true
  },
  orderDate: {
    type: Date
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  cgstRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 6
  },
  sgstRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 6
  },
  igstRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 12
  },
  transactionType: {
    type: String,
    enum: ['intrastate', 'interstate'],
    default: 'intrastate'
  },
  cgstAmount: {
    type: Number,
    required: true,
    min: 0
  },
  sgstAmount: {
    type: Number,
    required: true,
    min: 0
  },
  igstAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalTaxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },
  dueDate: {
    type: Date
  },
  userId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Invoice number is now generated in the API route before saving

// Clear any existing model to force schema refresh
if (mongoose.models.Invoice) {
  delete mongoose.models.Invoice;
}

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
