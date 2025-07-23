import { sql } from 'drizzle-orm';
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { menus } from './menus';

export const menuOptions = pgTable('menu_options', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  menuId: uuid('menu_id').references(() => menus.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updateAt: timestamp('updated_at'),
  status: text('status').default('pending'),
});
