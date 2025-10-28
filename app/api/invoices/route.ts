import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import { InvoiceCalculator } from '@/lib/utils/invoice';

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceType: z.enum(['proforma', 'tax']).optional(),
  state: z.string().optional(),
  stateCode: z.string().optional(),
  orderNumber: z.string().optional(),
  orderDate: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be 0 or greater')
  })).min(1, 'At least one item is required'),
  cgstRate: z.number().min(0).max(100).optional(),
  sgstRate: z.number().min(0).max(100).optional(),
  igstRate: z.number().min(0).max(100).optional(),
  transactionType: z.enum(['intrastate', 'interstate']).optional(),
  dueDate: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }

  try {
    
    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);
    
    // Validate invoice data
    const validationErrors = InvoiceCalculator.validateInvoiceData(validatedData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Process invoice calculations with new GST structure
    const cgstRate = validatedData.cgstRate || 6;
    const sgstRate = validatedData.sgstRate || 6;
    const igstRate = validatedData.igstRate || 12;
    const transactionType = validatedData.transactionType || 'intrastate';
    
    // Calculate item totals
    const items = validatedData.items.map(item => ({
      ...item,
      total: InvoiceCalculator.calculateItemTotal(item.quantity, item.unitPrice)
    }));

    // Calculate subtotal
    const subtotal = InvoiceCalculator.calculateSubtotal(items);
    
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
    
    // Generate invoice number if not provided
    const invoiceType = validatedData.invoiceType || 'proforma';
    let invoiceNumber = validatedData.invoiceNumber;
    if (!invoiceNumber) {
      const count = await Invoice.countDocuments({ invoiceType });
      invoiceNumber = `${invoiceType === 'tax' ? 'TAX' : 'INV'}-${String(count + 1).padStart(6, '0')}`;
    }
    
    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      invoiceType,
      state: validatedData.state || 'Maharashtra',
      stateCode: validatedData.stateCode || '27',
      orderNumber: validatedData.orderNumber,
      orderDate: validatedData.orderDate ? new Date(validatedData.orderDate) : undefined,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail || undefined,
      customerPhone: validatedData.customerPhone,
      customerAddress: validatedData.customerAddress,
      items,
      subtotal,
      cgstRate,
      sgstRate,
      igstRate,
      transactionType,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTaxAmount,
      totalAmount,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      userId: validatedData.userId
    });
    
    await invoice.save();
    
    return NextResponse.json({
      success: true,
      data: invoice
    });
    
  } catch (error: unknown) {
    console.error('Create invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }

  try {
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    // Build query
    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    const invoiceType = searchParams.get('invoiceType');
    if (invoiceType) query.invoiceType = invoiceType;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-__v');
    
    const total = await Invoice.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
