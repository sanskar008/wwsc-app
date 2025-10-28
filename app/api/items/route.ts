import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Item } from '@/lib/models/Item';

const createItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
  unitPacking: z.string().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
  } catch (dbError) {
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const validatedData = createItemSchema.parse(body);

    const item = new Item({
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      unitPrice: validatedData.unitPrice,
      unitPacking: validatedData.unitPacking,
      hsnCode: validatedData.hsnCode,
      gstRate: validatedData.gstRate,
      isActive: validatedData.isActive ?? true
    });

    await item.save();

    return NextResponse.json({ success: true, data: item });
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

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (activeOnly) filter.isActive = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(filter).sort({ category: 1, name: 1 });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

