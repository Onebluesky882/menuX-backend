import { InferInsertModel } from 'drizzle-orm';
import { menus } from '../database';

export type InsertMenus = InferInsertModel<typeof menus>;

export type MenuDto = Pick<
  InsertMenus,
  'shopId' | 'name' | 'price' | 'available' | 'createdBy' | 'id'
>;
