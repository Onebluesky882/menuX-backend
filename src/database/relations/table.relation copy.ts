import { relations } from 'drizzle-orm';
import { shopTables } from '../schema/shopTables';
import { shops } from '../schema/shops';

export const tableRelationShop = relations(shopTables, ({ one }) => ({
  shop: one(shops, {
    fields: [shopTables.shopId],
    references: [shops.id],
  }),
}));
