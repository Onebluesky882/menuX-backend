import { InferInsertModel } from 'drizzle-orm';
import { slipVerifications } from 'src/database';
export type PostSlipDto = {
  amount: string;
  qrcode_data: string;
  orderId?: string;
};

export type SlipVerify = {
  amount: string;
  qrcode_data: string;
  orderId?: string;
  receiverBank: string;
  receiverName: string;
  receiverId: string;
};

export type PaymentRecode = InferInsertModel<typeof slipVerifications>;
