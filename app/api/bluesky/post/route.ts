
import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@atproto/api';
import { getSession } from '../oauth/session/session';
import { AppBskyFeedPost } from '@atproto/api'

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        // Get the user's session (implement this based on your auth system)
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No session' }, { status: 401 });
        }

        const agent = new Agent(session);

        const postRecord: AppBskyFeedPost.Record = {
            $type: 'app.bsky.feed.post',
            text,
            createdAt: new Date().toISOString(),
        };

        if (!AppBskyFeedPost.isRecord(postRecord)) {
            return NextResponse.json({ error: 'Invalid post record' }, { status: 400 });
        }
        const res = await agent.post(postRecord);

        return NextResponse.json({ success: true, res });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}