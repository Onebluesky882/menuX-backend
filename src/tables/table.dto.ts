import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { shopTables } from '../database';

export type InsertTable = InferInsertModel<typeof shopTables>;
export type ReadTables = InferSelectModel<typeof shopTables>;

export type TableDto = Pick<
  InsertTable,
  | 'layoutId'
  | 'name'
  | 'number'
  | 'position'
  | 'status'
  | 'tableLink'
  | 'createdById'
  | 'shopId'
>;
