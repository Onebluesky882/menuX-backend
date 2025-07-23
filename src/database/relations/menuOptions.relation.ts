// schema/relations/menuOptionsRelations.ts
import { relations } from 'drizzle-orm';
import { menuOptions } from '../schema/menuOptions';
import { menus } from '../schema/menus';

export const menuOptionRelations = relations(menuOptions, ({ one }) => ({
  menu: one(menus, {
    fields: [menuOptions.menuId],
    references: [menus.id],
    relationName: 'menuOptions', // ต้องตรงกับใน menuRelations
  }),
}));
