import { sql } from 'drizzle-orm';
import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { customers } from './customers';
import { orderItems } from './orderItems';
import { shops } from './shops';
import { users } from './users';

export const orders = pgTable('orders', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  shopId: uuid('shop_id')
    .notNull()
    .references(() => shops.id),
  orderItems: uuid('orderItems_id').references(() => orderItems.id),
  queueNumber: text('queue_number'),
  status: text('status').default('pending'),
  customerId: uuid('customer_id').references(() => customers.id),
  createdById: uuid('create_by_id').references(() => users.id),
  quantity: numeric('quantity', { precision: 10, scale: 2 }), // reduce of all orderItem same orderId
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }), // reduce of all orderItem same orderId
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});
