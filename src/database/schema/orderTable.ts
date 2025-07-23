import { sql } from 'drizzle-orm';
import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { customers } from './customers';
import { shopTables } from './shopTables';
import { users } from './users';

// order_tables – โต๊ะที่สั่งออเดอร์ (1 โต๊ะ = 1 กลุ่มออเดอร์)
export const orderTable = pgTable('order_table', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: uuid('shop_id').references(() => shops.id),
  tableId: uuid('table_number').references(() => shopTables.id),
  customersId: uuid('customer_id').references(() => customers.id),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  token: text('token').unique(),
  createdById: uuid('create_by_id').references(() => users.id),
  orderCode: text('order_code').unique().notNull(), // for refer bill
});
/* 
order_table
  └── 1 → many orders
             └── 1 → many order_items
*/
