import { getBlueskyClient } from '@/lib/bluesky-client';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const handle = process.env.BLUESKY_HANDLE as string;
    const state = randomUUID();

    const blueskyClient = await getBlueskyClient();
    const url = await blueskyClient.authorize(handle, {
      state,
    });

    console.log(url);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Error during login:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : JSON.stringify(err),
      },
      { status: 500 }
    );
  }
}
