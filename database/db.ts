import { neonConfig, Pool } from '@neondatabase/serverless';
import { NeonDatabase, drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';

import { NodePgDatabase, drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import { WebSocket } from 'ws';

let db: NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

const connection =
  process.env.NODE_ENV === 'production'
    ? (process.env.DATABASE_URL as string)
    : (process.env.LOCAL_DATABASE_URL as string);

const pool = new Pool({ connectionString: connection });

if (process.env.NODE_ENV === 'production') {
  db = pgDrizzle({
    connection: {
      connectionString: connection,
      ssl: true,
    },
    schema
  });
} else {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
  db = neonDrizzle(pool, { schema });
}

export { db };