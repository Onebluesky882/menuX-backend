import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const lineUser = pgTable('line_users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().unique(),
  displayName: text('display_name'),
  pictureUrl: text('picture_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
