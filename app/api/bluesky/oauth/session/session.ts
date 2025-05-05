import { blueskyClient } from '@/lib/bluesky-client';
import { Agent } from '@atproto/api';

export async function getSession() {
    const userDid = 'did:plc:xfgl7z2pynkhazdv7wb3r4bq'
    const oauthSession = await blueskyClient.restore(userDid)

    // Note: If the current access_token is expired, the session will automatically
    // (and transparently) refresh it. The new token set will be saved though
    // the client's session store.

    // const agent = new Agent(oauthSession)

    // // Make Authenticated API calls
    // const profile = await agent.getProfile({ actor: agent.did as string })
    // console.log('Bsky profile:', profile.data)

    return oauthSession;
}