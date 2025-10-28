import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      mongodb_uri: process.env.MONGODB_URI ? 'configured' : 'not configured'
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      mongodb_uri: process.env.MONGODB_URI ? 'configured' : 'not configured',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
