import { NextRequest, NextResponse } from 'next/server';
import { xtreamApi } from '../../../lib/xtream-api';

// Cache for 5 minutes (300 seconds)
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    const streams = await xtreamApi.getStreams(categoryId || undefined);
    
    return NextResponse.json(streams, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch streams'
      },
      { status: 500 }
    );
  }
}
