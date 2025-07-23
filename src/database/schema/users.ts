import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').unique(), // Required
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  active: boolean('active').default(false),
  imageUrl: text('image_url'),
  updatedAt: timestamp('updated_at'),
  username: text('username'),
  lineId: text('line_id'),
});
