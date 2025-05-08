import { createAuthClient } from 'better-auth/react';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://blueskyscope.com'  // Your production domain
  : 'http://localhost:3000';    // Your local development domain

export const authClient = createAuthClient({
  baseURL,
});
