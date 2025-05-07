import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { blueskyCringePosts, blueskyUsers, blueskyPosts } from '@/database/schema/bluesky';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '../oauth/session/session';
import { auth } from '@/lib/auth';

// POST - Save a new cringe post to the database after posting to Bluesky
export async function POST(req: NextRequest) {
    try {
        // Get the authenticated user
        const sessionHeaders = new Headers(req.headers);
        const authSession = await auth.api.getSession({ headers: sessionHeaders });

        if (!authSession) {
            return NextResponse.json(
                { error: 'You must be logged in to save cringe posts' },
                { status: 401 }
            );
        }

        // Get the Bluesky session
        const blueskySession = await getSession();
        console.log("POST - Bluesky session DID:", blueskySession?.did);

        if (!blueskySession) {
            return NextResponse.json(
                { error: 'You must connect your Bluesky account to save cringe posts' },
                { status: 401 }
            );
        }

        // Get data from request
        const { text, prompt, isPosted, blueskyPostId, cid } = await req.json();
        console.log("POST - Text length:", text?.length,
            "Prompt:", prompt?.substring(0, 30),
            "isPosted:", isPosted,
            "blueskyPostId:", blueskyPostId,
            "cid:", cid);

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // First check if the user exists in blueskyUsers table
        const existingUser = await db.query.blueskyUsers.findFirst({
            where: eq(blueskyUsers.did, blueskySession.did)
        });

        console.log("POST - Existing user in blueskyUsers:", existingUser ? "Yes" : "No");

        if (!existingUser) {
            console.log("POST - User doesn't exist in blueskyUsers table, creating record");
            // We need to create the user first to satisfy the foreign key constraint
            try {
                // Create a user record with profile data
                await db.insert(blueskyUsers).values({
                    did: blueskySession.did,
                    handle: blueskySession.did.split(':')[2] || 'unknown',
                    email: `${blueskySession.did.split(':')[2] || 'unknown'}@bsky.social`
                });
                console.log("POST - Created user record for:", blueskySession.did);
            } catch (error) {
                console.error("POST - Error creating user record:", error);
                return NextResponse.json(
                    { error: 'Failed to create user record' },
                    { status: 500 }
                );
            }
        }

        console.log("POST - Attempting to save post with userId:", authSession.user.id, "and did:", blueskySession.did);

        // Save to database - only for posts that have been posted to Bluesky
        try {
            // Use only the fields we need - omitting postId to avoid the foreign key constraint
            const postData = {
                did: blueskySession.did,
                userId: authSession.user.id,
                text,
                prompt: prompt || null,
                isPosted: true,
                createdAt: new Date(),
                // Explicitly omit postId field
            };

            console.log("POST - Insert values:", postData);

            const newPost = await db.insert(blueskyCringePosts).values(postData).returning();

            console.log("POST - Post saved successfully, returned ID:", newPost[0]?.id);

            return NextResponse.json({
                success: true,
                post: newPost[0]
            });
        } catch (error) {
            console.error("POST - Database error saving post:", error);
            return NextResponse.json(
                { error: 'Database error saving post', details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('POST - Error saving cringe post:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
}

// GET - Retrieve cringe posts (either all or just by the current user)
export async function GET(req: NextRequest) {
    try {
        // Get the authenticated user
        const sessionHeaders = new Headers(req.headers);
        const authSession = await auth.api.getSession({ headers: sessionHeaders });

        console.log("GET - Auth session:", authSession?.user.id);

        if (!authSession) {
            return NextResponse.json(
                { error: 'You must be logged in to view cringe posts' },
                { status: 401 }
            );
        }

        // Get the Bluesky session
        const blueskySession = await getSession();
        console.log("GET - Bluesky session DID:", blueskySession?.did);

        if (!blueskySession) {
            return NextResponse.json(
                { error: 'You must connect your Bluesky account to view cringe posts' },
                { status: 401 }
            );
        }

        // Get the filter parameter - "all" shows all posts, anything else shows just the user's posts
        const filter = req.nextUrl.searchParams.get('filter') || 'user';
        console.log("GET - Filter:", filter);

        let whereCondition;
        if (filter === 'all') {
            // Show all posts from all users for the same Bluesky account
            whereCondition = eq(blueskyCringePosts.did, blueskySession.did);
            console.log("GET - Showing all posts for Bluesky account:", blueskySession.did);
        } else {
            // Filter by user ID (only the current user's posts)
            whereCondition = and(
                eq(blueskyCringePosts.userId, authSession.user.id),
                eq(blueskyCringePosts.did, blueskySession.did)
            );
            console.log("GET - Showing posts for user:", authSession.user.id);
        }

        // Get posts from database, ordered by most recent first
        const posts = await db.query.blueskyCringePosts.findMany({
            where: whereCondition,
            orderBy: [desc(blueskyCringePosts.createdAt)]
        });

        console.log("GET - Found posts:", posts.length);

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('GET - Error retrieving cringe posts:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
} 