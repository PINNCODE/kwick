import { NextRequest, NextResponse } from 'next/server';
import { xtreamApi } from '../../../lib/xtream-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host } = body;

    if (!host) {
      return NextResponse.json(
        { error: 'Host URL is required' },
        { status: 400 }
      );
    }

    const result = await xtreamApi.checkConnectivity(host);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        reachable: false, 
        latency: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
