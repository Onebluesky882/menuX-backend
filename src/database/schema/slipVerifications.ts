import { sql } from 'drizzle-orm';
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const slipVerifications = pgTable('slip-verifications', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slipCode: text('slip_code').notNull().unique(),
  orderId: uuid('orderId').references(() => orders.id),
  ref: text('ref').notNull(),
  date: timestamp('create_at').defaultNow(),
  senderBank: text('sender_bank').notNull(),
  senderName: text('sender_name').notNull(),
  senderId: text('sender_id').notNull(),
  receiverBank: text('receiver_bank').notNull(),
  receiverName: text('receiver_name').notNull(),
  receiverId: text('receiver_id').notNull(),
  amount: numeric('amount').notNull(),
  status: boolean('status').notNull(),
});
