import { blueskyClient } from '@/lib/bluesky-client';
import { Agent } from '@atproto/api';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { db } from '@/database/db';
import { users } from '@/database/schema/auth';
import { eq } from 'drizzle-orm';

export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // if (session && session.user) {
    //     const user = await db.query.users.findFirst({
    //         where: eq(users.id, session.user.id)
    //     })
    //     if (!user?.did) {
    //         return null;
    //     } else {
    //     }
    // });
    const userDid = 'did:plc:xfgl7z2pynkhazdv7wb3r4bq'
    const oauthSession = await blueskyClient.restore(userDid)
    return oauthSession;
}