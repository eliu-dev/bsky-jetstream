import { getBlueskyClient } from '@/lib/bluesky-client';
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

    if (!session?.user) {
        return null;
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id)
    });

    if (!user?.blueskyUserId) {
        return null;
    }

    const blueskyClient = await getBlueskyClient();
    try {
        const oauthSession = await blueskyClient.restore(user.blueskyUserId);
        return oauthSession;
    } catch (error) {
        console.error('Error restoring Bluesky session:', error);
        return null;
    }
}