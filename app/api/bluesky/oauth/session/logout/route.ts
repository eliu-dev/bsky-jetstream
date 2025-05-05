import { blueskyClient } from '@/lib/bluesky-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // For demo purposes assuming we have the DID - in production you would get this from your session
        const userDid = 'did:plc:xfgl7z2pynkhazdv7wb3r4bq'; // Or get from request/session

        // Revoke the session token
        await blueskyClient.revoke(userDid);

        return NextResponse.json({ ok: true, message: 'Successfully logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : JSON.stringify(error)
            },
            { status: 500 }
        );
    }
} 