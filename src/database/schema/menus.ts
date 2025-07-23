import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { users } from './users';

export const menus = pgTable('menus', {
  id: uuid('id').primaryKey().unique().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  shopId: uuid('shop_id')
    .notNull()
    .references(() => shops.id, { onDelete: 'cascade' }),
});
