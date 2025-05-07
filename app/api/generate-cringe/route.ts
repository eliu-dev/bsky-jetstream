import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const response = await fetch(
            'https://bluesky-cringe-generator-895544443438.us-east4.run.app/generateCringyTweet',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to generate cringe post');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error generating cringe post:', error);
        return NextResponse.json(
            { error: 'Failed to generate cringe post' },
            { status: 500 }
        );
    }
} 