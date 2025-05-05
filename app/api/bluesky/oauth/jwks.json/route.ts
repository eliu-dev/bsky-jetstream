import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const publicJwksPath = path.join(
    process.cwd(),
    './app/api/bluesky/oauth/jwks.json/jwks.json'
  );
  const publicJwks = JSON.parse(fs.readFileSync(publicJwksPath, 'utf8'));
  console.log(publicJwks);

  return NextResponse.json(publicJwks, {
    status: 200,
  });
}
