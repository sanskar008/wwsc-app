import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Quotation } from '@/lib/models/Quotation';

const quotationItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unitPacking: z.string().optional(),
  quantity: z.number().min(1).default(1),
  rateIncludingGST: z.number().min(0),
  mrp: z.number().min(0).optional()
});

const createQuotationSchema = z.object({
  quotationNumber: z.string().optional(),
  referenceLetter: z.string().optional(),
  quotationDate: z.string().optional(),
  toName: z.string(),
  toDesignation: z.string().optional(),
  toDepartment: z.string().optional(),
  toAddress: z.string().optional(),
  subject: z.string().optional(),
  items: z.array(quotationItemSchema).min(1),
  notes: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
  } catch (dbError) {
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const payload = createQuotationSchema.parse(body);

    const itemsWithTotals = payload.items.map((i) => ({
      ...i,
      total: (i.quantity || 1) * i.rateIncludingGST
    }));
    const subtotal = itemsWithTotals.reduce((sum, i) => sum + i.total, 0);

    let quotationNumber = payload.quotationNumber;
    if (!quotationNumber) {
      const count = await Quotation.countDocuments();
      quotationNumber = `QTN-${String(count + 1).padStart(6, '0')}`;
    }

    const quotation = new Quotation({
      quotationNumber,
      referenceLetter: payload.referenceLetter,
      quotationDate: payload.quotationDate ? new Date(payload.quotationDate) : new Date(),
      toName: payload.toName,
      toDesignation: payload.toDesignation,
      toDepartment: payload.toDepartment,
      toAddress: payload.toAddress,
      subject: payload.subject,
      items: itemsWithTotals,
      subtotal,
      notes: payload.notes,
      userId: payload.userId
    });

    await quotation.save();
    return NextResponse.json({ success: true, data: quotation });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '10');
  const search = (searchParams.get('search') || '').trim();

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { quotationNumber: { $regex: search, $options: 'i' } },
      { toName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [quotations, total] = await Promise.all([
    Quotation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Quotation.countDocuments(filter)
  ]);

  return NextResponse.json({
    success: true,
    data: {
      quotations,
      pagination: {
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total
      }
    }
  });
}


