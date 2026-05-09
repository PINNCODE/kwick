import { NextRequest, NextResponse } from 'next/server';
import { xtreamApi } from '../../../lib/xtream-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, username, password } = body;

    if (!host || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Host, username, and password are required' },
        { status: 400 }
      );
    }

    const result = await xtreamApi.authenticate({ host, username, password });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        result,
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed'
      },
      { status: 500 }
    );
  }
}
