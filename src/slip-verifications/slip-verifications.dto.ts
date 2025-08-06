import { InferInsertModel } from 'drizzle-orm';
import { orders, shops, slipVerifications } from '../../src/database/index';

export type Order = InferInsertModel<typeof orders>;
export type Shop = InferInsertModel<typeof shops>;
export type PostSlipDto = {
  amount: string;
  qrcode_data: string;
  orderId?: string;
};

export type SlipVerify = {
  amount: string;
  qrcode_data: string;
  orderId: string;
  receiverBank: string;
  receiverName: string;
  receiverId: string;
};

export type PaymentRecode = InferInsertModel<typeof slipVerifications>;
