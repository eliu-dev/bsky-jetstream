// Create an endpoint to handle the OAuth callback
import { blueskyClient } from '@/lib/bluesky-client';
import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@atproto/api';
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export async function GET(
  request: NextRequest
): Promise<
  NextResponse<{ [key: string]: boolean | string | ProfileViewDetailed }>
> {
  console.log(request);
  try {
    const params = new URLSearchParams(request.nextUrl.searchParams);
    const { session, state } = await blueskyClient.callback(params);

    // Process successful authentication here
    console.log('authorize() was called with state:', state);

    console.log('User authenticated as:', session.did);

    const agent = new Agent(session);

    // Make Authenticated API calls
    if (agent.did) {
      const profile = await agent.getProfile({ actor: agent.did });
      console.log('Bsky profile:', profile.data);
      return NextResponse.json(
        { ok: true, profile: profile.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { ok: false, message: 'User did not authenticate' },
        { status: 401 }
      );
    }
  } catch (err: unknown) {
    console.error('Server error: ', err);
    return NextResponse.json(
      {
        okay: false,
        error: err instanceof Error ? err.message : JSON.stringify(err),
      },
      { status: 400 }
    );
  }
}
