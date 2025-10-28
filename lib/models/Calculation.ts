import mongoose, { Schema, Document } from 'mongoose';

export interface ICalculation extends Document {
  operation: string;
  operands: number[];
  result: number;
  timestamp: Date;
  userId?: string;
}

const CalculationSchema: Schema = new Schema({
  operation: {
    type: String,
    required: true,
    enum: ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'factorial']
  },
  operands: {
    type: [Number],
    required: true
  },
  result: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: false
  }
});

export default mongoose.models.Calculation || mongoose.model<ICalculation>('Calculation', CalculationSchema);
