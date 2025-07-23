import { relations } from 'drizzle-orm';
import { images, menuOptions, menus } from '..';
import { shops } from '..';

//  menu reference shop
export const menuRelationShop = relations(menus, ({ one }) => ({
  shop: one(shops, {
    fields: [menus.shopId],
    references: [shops.id],
  }),
}));

/* 

สิ่งสำคัญ

ต้องมีทั้ง 2 ฝั่ง - Parent และ Child
relationName ต้องตรงกัน ระหว่าง 2 ฝั่ง
Parent ใช้ many() - Child ใช้ one()
Export ครบทุก relation ใน schema index
Import ใน database config ด้วย schema



 Parent Table (menus) - ใช้ many()
export const menuRelations = relations(menus, ({ many }) => ({
  images: many(images, {
    relationName: 'menuImages', // ชื่อต้องตรงกัน
  }),
  menuOptions: many(menuOptions, {
    relationName: 'menuOptions', // ชื่อต้องตรงกัน
  }),
}));

 Child Table (images) - ใช้ one()
export const imageRelations = relations(images, ({ one }) => ({
  menu: one(menus, {
    fields: [images.menuId],
    references: [menus.id],
    relationName: 'menuImages', // ชื่อต้องตรงกัน
  }),
}));

 Child Table (menuOptions) - ใช้ one()
export const menuOptionRelations = relations(menuOptions, ({ one }) => ({
  menu: one(menus, {
    fields: [menuOptions.menuId],
    references: [menus.id],
    relationName: 'menuOptions', // ชื่อต้องตรงกัน
  }),
}));
*/
export const menuRelations = relations(menus, ({ many }) => ({
  images: many(images, {
    relationName: 'menuImages', // optional
  }),
  menuOptions: many(menuOptions, {
    relationName: 'menuOptions', // optional
  }),
}));
