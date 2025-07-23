import { sql } from 'drizzle-orm';

import { boolean, date, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { users } from './users';
import { roles } from './roles';

export const employees = pgTable('employees', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  active: boolean('active').default(false),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  shopId: uuid('shop_id').references(() => shops.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  roleId: uuid('role_id').references(() => roles.id),
});
