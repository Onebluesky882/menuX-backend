import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { shops } from '../database';

export type SelectShop = InferSelectModel<typeof shops>;
export type InsertShop = InferInsertModel<typeof shops>;
