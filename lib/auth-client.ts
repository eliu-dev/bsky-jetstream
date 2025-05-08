import { createAuthClient } from 'better-auth/react';

const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.PRODUCTION_CLIENT_ID
  : process.env.LOCAL_CLIENT_ID;

export const authClient = createAuthClient({
  baseURL,
});
