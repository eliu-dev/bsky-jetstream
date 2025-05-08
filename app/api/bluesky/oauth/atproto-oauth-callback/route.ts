// Create an endpoint to handle the OAuth callback
import { getBlueskyClient } from '@/lib/bluesky-client';
import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@atproto/api';
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  console.log(request);
  try {
    const params = new URLSearchParams(request.nextUrl.searchParams);
    const blueskyClient = await getBlueskyClient();
    const { session, state } = await blueskyClient.callback(params);

    // Process successful authentication here
    console.log('authorize() was called with state:', state);
    console.log('User authenticated as:', session.did);

    // Force redirect to localhost regardless of the incoming host
    // This is for development when using Ngrok
    const redirectUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/settings'
      : `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host') || 'localhost:3000'}/settings`;

    // Redirect back to the settings page
    return NextResponse.redirect(redirectUrl);
  } catch (err: unknown) {
    console.error('Server error: ', err);

    // Force redirect to localhost on error too
    const redirectUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/settings?error=authentication_failed'
      : `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host') || 'localhost:3000'}/settings?error=authentication_failed`;

    // On error, still redirect back to settings page
    return NextResponse.redirect(redirectUrl);
  }
}
