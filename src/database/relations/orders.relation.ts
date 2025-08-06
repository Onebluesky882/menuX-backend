import { relations } from 'drizzle-orm';
import { menuOptions } from '../schema/menuOptions';
import { menus } from '../schema/menus';
import { orderItems } from '../schema/orderItems';
import { orders } from '../schema/orders';
import { shops } from '../schema/shops'; // หรือจาก '..' แล้วแต่ path

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  menu: one(menus, {
    fields: [orderItems.menuId],
    references: [menus.id],
  }),
  menuOption: one(menuOptions, {
    fields: [orderItems.optionId],
    references: [menuOptions.id],
  }),
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  shop: one(shops, {
    fields: [orders.shopId],
    references: [shops.id],
  }),
  orderItems: many(orderItems),
}));
