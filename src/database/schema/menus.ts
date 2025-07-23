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
import { pages } from './pages';
import { categories } from './categories';

export const menus = pgTable('menus', {
  id: uuid('id').primaryKey().unique().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  pageId: uuid('page_id').references(() => pages.id),
  shopId: uuid('shop_id')
    .notNull()
    .references(() => shops.id, { onDelete: 'cascade' }),
});
