import { InferInsertModel } from 'drizzle-orm';
import { orderTable } from '../database';

export type InsertOrdersTable = InferInsertModel<typeof orderTable>;

export type CreateOrderTableDto = InsertOrdersTable;

export type OrderTableDto = Pick<
  InsertOrdersTable,
  | 'customersId'
  | 'token'
  | 'shopId'
  | 'status'
  | 'tableId'
  | 'totalPrice'
  | 'updatedAt'
  | 'createdById'
  | 'orderCode'
>;
