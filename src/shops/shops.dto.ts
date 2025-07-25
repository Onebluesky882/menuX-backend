import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { shops } from '../database';

export type SelectShop = InferSelectModel<typeof shops>;
export type InsertShop = InferInsertModel<typeof shops>;

export type ReceiveBank = {
  bankCode?: string | null | undefined;
  bankAccount?: string | null | undefined;
  bankId?: string | null | undefined;
};
