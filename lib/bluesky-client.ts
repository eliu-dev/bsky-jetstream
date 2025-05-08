import {
  NodeOAuthClient,
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
  OAuthClientIdDiscoverable,
} from '@atproto/oauth-client-node';

import { db } from '@/database/db';

import {
  blueskySessionStore,
  blueskyStateStore,
} from '@/database/schema';
import { eq } from 'drizzle-orm';
import { JoseKey } from '@atproto/jwk-jose';

const clientId =
  process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_CLIENT_ID
    : process.env.DEVELOPMENT_CLIENT_ID;

let blueskyClientInstance: NodeOAuthClient | null = null;

export async function getBlueskyClient(): Promise<NodeOAuthClient> {
  if (!blueskyClientInstance) {
    blueskyClientInstance = await NodeOAuthClient.fromClientId({
      clientId:
        `${clientId}/api/bluesky/oauth/client-metadata.json` as OAuthClientIdDiscoverable,

      keyset: await Promise.all([
        JoseKey.fromImportable(process.env.JWT_PRIVATE_KEY_1 as string),
        JoseKey.fromImportable(process.env.JWT_PRIVATE_KEY_2 as string),
        JoseKey.fromImportable(process.env.JWT_PRIVATE_KEY_3 as string),
      ]),

      stateStore: {
        async set(key: string, internalState: NodeSavedState): Promise<void> {
          await db
            .insert(blueskyStateStore)
            .values({ key, internalState: internalState });
        },
        async get(key: string): Promise<NodeSavedState | undefined> {
          const result = await db.query.blueskyStateStore.findFirst({
            where: eq(blueskyStateStore.key, key),
          });
          return result ? (result.internalState as NodeSavedState) : undefined;
        },
        async del(key: string): Promise<void> {
          await db.delete(blueskyStateStore).where(eq(blueskyStateStore.key, key));
        },
      } as NodeSavedStateStore,

      sessionStore: {
        async set(sub: string, session: NodeSavedSession): Promise<void> {
          await db.insert(blueskySessionStore).values({ sub, session });
        },
        async get(sub: string): Promise<NodeSavedSession | undefined> {
          const result = await db.query.blueskySessionStore.findFirst({
            where: eq(blueskySessionStore.sub, sub),
          });
          return result ? (result.session as NodeSavedSession) : undefined;
        },
        async del(sub: string): Promise<void> {
          await db
            .delete(blueskySessionStore)
            .where(eq(blueskySessionStore.sub, sub));
        },
      } as NodeSavedSessionStore,
    });
  }
  return blueskyClientInstance;
}
