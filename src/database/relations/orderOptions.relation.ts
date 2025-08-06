import { relations } from 'drizzle-orm';
import { menuOptions } from '../schema/menuOptions';
import { menus } from '../schema/menus';
import { orderItems } from '../schema/orderItems';

export const orderItemsToMenusRelations = relations(orderItems, ({ one }) => ({
  menu: one(menus, {
    fields: [orderItems.menuId],
    references: [menus.id],
  }),
}));

export const orderItemsToMenusOptionRelations = relations(
  orderItems,
  ({ one }) => ({
    menuOption: one(menuOptions, {
      fields: [orderItems.optionId],
      references: [menuOptions.id],
    }),
  }),
);
