import { uuid, text, jsonb, pgTable } from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { z } from 'zod';

export const blueskyStateStore = pgTable('bluesky_state_store', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull(),
  internalState: jsonb('internal_state').notNull(),
});

export const blueskySessionStore = pgTable('bluesky_session_store', {
  id: uuid('id').primaryKey().defaultRandom(),
  sub: text('sub').notNull(),
  session: jsonb('session').notNull(),
});

export const insertBlueskyState = createInsertSchema(blueskyStateStore);
export type BlueskyState = z.infer<typeof insertBlueskyState>;

export const getBlueskyState = createSelectSchema(blueskyStateStore);

export const insertBlueskySession = createInsertSchema(blueskySessionStore);
export type BlueskySession = z.infer<typeof insertBlueskySession>;

export const getBlueskySession = createSelectSchema(blueskySessionStore);
