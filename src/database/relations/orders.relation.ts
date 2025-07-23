import { relations } from 'drizzle-orm';
import { orders } from '../schema/orders';
import { orderItems } from '..';

// 1. order → orderItems
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

// 2. orderItem → order
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
