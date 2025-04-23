import { NextResponse } from 'next/server';

const clientId =
  process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_CLIENT_ID
    : process.env.DEVELOPMENT_CLIENT_ID;

export async function GET() {
  const scopes = ['atproto', 'transition:generic'];
  console.log(scopes.join(' '));

  const metadata = {
    client_id: `${clientId}/api/bluesky/auth/client-metadata.json`,
    client_name: 'Bluesky Jetstream',
    scope: scopes.join(' '),
    redirect_uris: [clientId + '/api/bluesky/auth/atproto-oauth-callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    application_type: 'web',
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'ES256',
    dpop_bound_access_tokens: true,
    jwks_uri: `${clientId}/api/bluesky/auth/jwks.json`,
  };

  return NextResponse.json(metadata, {
    status: 200,
  });
}
