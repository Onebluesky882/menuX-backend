import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { images } from '../database/schema/images';

export type InsertImage = InferInsertModel<typeof images>;
export type SelectImage = InferSelectModel<typeof images>;

export class ImageDto {
  type: string = '';
  shopId?: string;
  menuId?: string;
  imageUrl?: string | null | undefined;
}
