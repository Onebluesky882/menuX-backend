import { sql } from 'drizzle-orm';

import { pgTable, text, uuid, numeric } from 'drizzle-orm/pg-core';
import { shops } from './shops';

export const tableGridLayout = pgTable('table_grids_layout', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  rows: numeric('rows'),
  columns: numeric('columns'),
  shopId: uuid('shop_id')
    .notNull()
    .references(() => shops.id, { onDelete: 'cascade' }),
});
