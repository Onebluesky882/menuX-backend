import { relations } from 'drizzle-orm';
import { shops } from '../schema/shops';
import { images } from '../schema/images';

export const tableRelationShop = relations(images, ({ one }) => ({
  shop: one(shops, {
    fields: [images.shopId],
    references: [shops.id],
  }),
}));
