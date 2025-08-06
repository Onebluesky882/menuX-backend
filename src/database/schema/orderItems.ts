import { sql } from 'drizzle-orm';
import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { menuOptions } from './menuOptions';
import { menus } from './menus';
import { orders } from './orders';

export const orderItems = pgTable('order_items', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'cascade',
  }),
  optionId: uuid('option_id').references(() => menuOptions.id),
  menuId: uuid('menu_id').references(() => menus.id),
  quantity: numeric('quantity', { precision: 10, scale: 2 }),
  priceEach: numeric('price_each', { precision: 10, scale: 2 }),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  status: text('status').default('pending'),
});
