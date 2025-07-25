import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const mock = pgTable('mock', {
  id: uuid('id'),
});
