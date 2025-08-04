import { relations } from 'drizzle-orm';
import { orderItems, shops } from '..';
import { orders } from '../schema/orders';

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

// orders.ShopId <-> shops.id
export const ordersRelationsWithShop = relations(orders, ({ one }) => ({
  shop: one(shops, {
    fields: [orders.shopId],
    references: [shops.id],
  }),
}));
