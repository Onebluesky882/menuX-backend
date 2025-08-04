import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const shops = pgTable('shops', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  active: boolean('active').default(true),
  receiveBank: text('receive_bank'),
  receiverId: text('receiver_id'),
  receiverName: text('receiver_name'),
});

/* 
todo 
change name follow json 
 
  receiverBank: text('receiver_Bank'),
  receiverName: text('receiver_name'),
  receiverId: text('receiver_id'),

*/
