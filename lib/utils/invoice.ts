import { IInvoiceItem } from '@/lib/models/Invoice';

export interface InvoiceCalculation {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
}

export interface CreateInvoiceRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Omit<IInvoiceItem, 'total'>[];
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  transactionType?: 'intrastate' | 'interstate';
  dueDate?: string;
  userId?: string;
}

export class InvoiceCalculator {
  static calculateItemTotal(quantity: number, unitPrice: number): number {
    return Math.round((quantity * unitPrice) * 100) / 100;
  }

  static calculateSubtotal(items: IInvoiceItem[]): number {
    return items.reduce((sum, item) => sum + item.total, 0);
  }

  static calculateTotal(subtotal: number, totalTaxAmount: number): number {
    return Math.round((subtotal + totalTaxAmount) * 100) / 100;
  }

  static processInvoiceData(request: CreateInvoiceRequest): {
    items: IInvoiceItem[];
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalTaxAmount: number;
    totalAmount: number;
  } {
    const cgstRate = request.cgstRate || 6;
    const sgstRate = request.sgstRate || 6;
    const igstRate = request.igstRate || 12;
    const transactionType = request.transactionType || 'intrastate';

    // Calculate item totals
    const items: IInvoiceItem[] = request.items.map(item => ({
      ...item,
      total: this.calculateItemTotal(item.quantity, item.unitPrice)
    }));

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(items);

    // Calculate taxes based on transaction type
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    if (transactionType === 'intrastate') {
      cgstAmount = (subtotal * cgstRate) / 100;
      sgstAmount = (subtotal * sgstRate) / 100;
    } else {
      igstAmount = (subtotal * igstRate) / 100;
    }
    
    const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
    const totalAmount = subtotal + totalTaxAmount;

    return {
      items,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTaxAmount,
      totalAmount
    };
  }

  static validateInvoiceData(request: CreateInvoiceRequest): string[] {
    const errors: string[] = [];

    if (!request.customerName?.trim()) {
      errors.push('Customer name is required');
    }

    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (request.items) {
      request.items.forEach((item, index) => {
        if (!item.name?.trim()) {
          errors.push(`Item ${index + 1}: Name is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!item.unitPrice || item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Unit price must be 0 or greater`);
        }
      });
    }

    if (request.cgstRate !== undefined && (request.cgstRate < 0 || request.cgstRate > 100)) {
      errors.push('CGST rate must be between 0 and 100');
    }

    if (request.sgstRate !== undefined && (request.sgstRate < 0 || request.sgstRate > 100)) {
      errors.push('SGST rate must be between 0 and 100');
    }

    if (request.igstRate !== undefined && (request.igstRate < 0 || request.igstRate > 100)) {
      errors.push('IGST rate must be between 0 and 100');
    }

    if (request.transactionType && !['intrastate', 'interstate'].includes(request.transactionType)) {
      errors.push('Transaction type must be either intrastate or interstate');
    }

    if (request.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.customerEmail)) {
      errors.push('Invalid email format');
    }

    return errors;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  static formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
