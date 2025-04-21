import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import { WebSocket } from 'ws';

const connection =
  process.env.NODE_ENV === 'production'
    ? (process.env.DATABASE_URL as string)
    : (process.env.LOCAL_DATABASE_URL as string);

const pool = new Pool({ connectionString: connection });

if (process.env.NODE_ENV === 'production') {
  neonConfig.webSocketConstructor = WebSocket;
  neonConfig.poolQueryViaFetch = true;
} else {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

export const db = drizzle(pool, { schema });
