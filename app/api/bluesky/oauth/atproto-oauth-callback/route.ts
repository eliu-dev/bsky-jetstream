// Create an endpoint to handle the OAuth callback
import { blueskyClient } from '@/lib/bluesky-client';
import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@atproto/api';
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  console.log(request);
  try {
    const params = new URLSearchParams(request.nextUrl.searchParams);
    const { session, state } = await blueskyClient.callback(params);

    // Process successful authentication here
    console.log('authorize() was called with state:', state);
    console.log('User authenticated as:', session.did);

    // Get the protocol and host from the request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';

    // Redirect back to the settings page with absolute URL
    return NextResponse.redirect(`${protocol}://${host}/settings`);
  } catch (err: unknown) {
    console.error('Server error: ', err);

    // Get the protocol and host from the request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';

    // On error, still redirect back to settings page with absolute URL
    return NextResponse.redirect(`${protocol}://${host}/settings?error=authentication_failed`);
  }
}
