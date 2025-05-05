import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';
import { Agent } from '@atproto/api';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ ok: false, message: 'No active session' });
        }

        const agent = new Agent(session);

        // Make Authenticated API calls
        const profile = await agent.getProfile({ actor: agent.did as string });

        return NextResponse.json({
            ok: true,
            profile: profile.data,
            did: agent.did
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({
            ok: false,
            error: error instanceof Error ? error.message : JSON.stringify(error)
        }, { status: 500 });
    }
}