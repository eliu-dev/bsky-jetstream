import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const blueskyUsers = pgTable('bluesky_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  did: text('did').notNull().unique(),
  handle: text('handle').notNull(),
  email: text('email').notNull().unique(),
});

export const blueskyPosts = pgTable('bluesky_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  cid: text('id').notNull().unique(),
  type: text('type').notNull(),
  text: text('text').notNull(),
  collection: text('collection'),
  time_us: timestamp('time_us'),
  rkey: text('rkey'),
  did: text('did')
    .notNull()
    .references(() => blueskyUsers.did, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
});

export const blueskyCringePosts = pgTable('bluesky_cringe_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  did: text('did')
    .notNull()
    .references(() => blueskyUsers.did, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
});

export const blueskyCommit = pgTable('bluesky_commits', {
  id: uuid('id').primaryKey().defaultRandom(),
  did: text('did')
    .notNull()
    .references(() => blueskyUsers.did, { onDelete: 'cascade' }),
  time_us: timestamp('time_us'),
  kind: text('kind'),
  commit: jsonb(),
});

export type InsertUser = typeof blueskyUsers.$inferInsert;
export type SelectUser = typeof blueskyUsers.$inferSelect;

export type BlueskyCommitType = 'create' | 'update' | 'delete';
export type BlueskyUpdateEventType = 'commit' | 'account' | 'identity';

export type InsertPost = typeof blueskyPosts.$inferInsert;
export type SelectPost = typeof blueskyPosts.$inferSelect;
