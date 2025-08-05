import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { orders } from 'src/database';

export type InsertOrders = InferInsertModel<typeof orders>;
export type SelectOrders = InferSelectModel<typeof orders>;

export type CreateOrderDto = {
  shopId: string;
  items: {
    menuId: string;
    quantity: string;
    priceEach: string;
    totalPrice: string;
    status?: string;
    optionId?: string;
  }[];
};

export type OrderPurchase = {
  status:
    | 'pending'
    | 'paid'
    | 'in_progress'
    | 'ready'
    | 'completed'
    | 'canceled';
};
