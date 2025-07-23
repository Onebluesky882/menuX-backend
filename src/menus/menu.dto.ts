import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { menus } from '../database';

export type InsertMenu = InferInsertModel<typeof menus>;
export type SelectMenu = InferSelectModel<typeof menus>;

export class MenuDto {
  id: string = '';
  name: string = '';
  price: string = '';
}
