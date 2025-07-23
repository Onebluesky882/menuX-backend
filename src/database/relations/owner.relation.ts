import { relations } from 'drizzle-orm';
import { shops, users } from '..';

// defined
export const ownerRelationShop = relations(shops, ({ one }) => ({
  owner: one(users, {
    fields: [shops.ownerId],
    references: [users.id],
  }),
}));
