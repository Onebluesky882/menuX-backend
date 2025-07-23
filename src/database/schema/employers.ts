import { sql } from 'drizzle-orm';
import { boolean, date, pgTable, uuid } from 'drizzle-orm/pg-core';
import { shops } from './shops';

export const employers = pgTable('categories', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  active: boolean('active').default(false),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  shopId: uuid('shop_id').references(() => shops.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
});
