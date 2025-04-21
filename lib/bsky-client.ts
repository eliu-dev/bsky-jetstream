// import {
//   NodeOAuthClient,
//   NodeSavedSession,
//   NodeSavedState,
//   OAuthClientMetadataInput,
//   Session,
// } from '@atproto/oauth-client-node';
// import { JoseKey } from '@atproto/jwk-jose';
// import * as clientMetadata from '@/lib/bsky-client-metadata.json';
// import { readFileSync } from 'fs';

// const client = new NodeOAuthClient({
//   // This object will be used to build the payload of the /client-metadata.json
//   // endpoint metadata, exposing the client metadata to the OAuth server.
//   clientMetadata: clientMetadata as OAuthClientMetadataInput,

//   // Used to authenticate the client to the token endpoint. Will be used to
//   // build the jwks object to be exposed on the "jwks_uri" endpoint.
//   keyset: await Promise.all([
//     JoseKey.fromImportable(process.env.BLUESKY_CLIENT_KEY as string),
//   ]),

//   // Interface to store authorization state data (during authorization flows)
//   stateStore: {
//     async set(key: string, internalState: NodeSavedState): Promise<void> {},
//     async get(key: string): Promise<NodeSavedState | undefined> {},
//     async del(key: string): Promise<void> {},
//   },

//   // Interface to store authenticated session data
//   sessionStore: {
//     async set(sub: string, sessionData: NodeSavedSession) {
//       // Insert or update the session data in your database
//       await saveSessionDataToDb(sub, sessionData);
//     },

//     async get(sub: string) {
//       // Retrieve the session data from your database
//       const sessionData = await getSessionDataFromDb(sub);
//       if (!sessionData) return undefined;

//       return sessionData;
//     },

//     async del(sub: string) {
//       // Delete the session data from your database
//       await deleteSessionDataFromDb(sub);
//     },
//   },
// });
