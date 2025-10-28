import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Quotation } from '@/lib/models/Quotation';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


