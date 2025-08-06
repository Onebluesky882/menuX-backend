import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { firstValueFrom } from 'rxjs';
import { slipVerifications } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { schema, shops } from '../database';
import { orders } from '../database/schema/orders';
import { PostSlipDto, Shop } from './slip-verifications.dto';
@Injectable()
export class SlipVerificationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly http: HttpService,
  ) {}

  async shopCheckBackDetail({ amount, qrcode_data }: PostSlipDto) {
    const url = `https://ucwgwgkko4wk408ggsk0cosw.oiio.download/api/slip/${amount}/no_slip`;

    try {
      const res = await firstValueFrom(this.http.post(url, { qrcode_data }));
      const slipData = res.data.data;
      return {
        success: true,
        data: slipData,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'transaction unsuccess!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async shopCheckAccount({ amount, qrcode_data }: PostSlipDto) {
    const url = `https://ucwgwgkko4wk408ggsk0cosw.oiio.download/api/slip/${amount}/no_slip`;

    try {
      const res = await firstValueFrom(this.http.post(url, { qrcode_data }));
      const slipData = res.data.data;

      return {
        success: true,
        data: slipData,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'transaction unsuccess!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSuccess(orderId: string) {
    return this.db
      .select({
        orderId: slipVerifications.orderId,
        ref: slipVerifications.ref,
        date: slipVerifications.date,
        senderName: slipVerifications.senderName,
        receiverBank: slipVerifications.receiverBank,
        receiverName: slipVerifications.receiverName,
        receiverId: slipVerifications.receiverId,
        amount: slipVerifications.amount,
        status: slipVerifications.status,
      })
      .from(slipVerifications)
      .where(eq(slipVerifications.orderId, orderId));
  }

  async slipVerification({ amount, qrcode_data, orderId }: PostSlipDto) {
    const url = `https://ucwgwgkko4wk408ggsk0cosw.oiio.download/api/slip/${amount}/no_slip`;

    try {
      const res = await firstValueFrom(this.http.post(url, { qrcode_data }));
      const slipData = res.data.data;

      if (!slipData?.amount || !slipData?.receiver_bank) {
        throw new BadRequestException('Invalid slip data returned from server');
      }

      const rawResult = await this.db
        .select()
        .from(orders)
        .leftJoin(shops, eq(orders.shopId, shops.id))
        .where(eq(orders.id, orderId))
        .then((rows) => rows[0]);

      if (!rawResult) {
        throw new BadRequestException('Order not found');
      }

      const order = rawResult.orders;
      const shop: Shop = rawResult.shops ?? null;

      if (order.totalPrice == null) {
        throw new BadRequestException('Order missing total price');
      }

      if (Number(slipData.amount) !== Number(order.totalPrice)) {
        throw new BadRequestException(
          `Amount mismatch: slip=${slipData.amount}, expected=${order.totalPrice}`,
        );
      }

      if (shop?.receiveBank !== slipData.receiver_bank) {
        throw new BadRequestException(
          `Receiver bank mismatch: slip=${slipData.receiver_bank}, expected=${shop?.receiveBank}`,
        );
      }
      if (shop?.receiverName !== slipData.receiver_name) {
        throw new BadRequestException(
          `Receiver name mismatch: slip=${slipData.receiver_name}, expected=${shop?.receiverName}`,
        );
      }
      if (shop?.receiverId !== slipData.receiver_id) {
        throw new BadRequestException(
          `Receiver id mismatch: slip=${slipData.receiver_id}, expected=${shop?.receiverId}`,
        );
      }

      if (!orderId) {
        throw new BadRequestException(`orderId error`);
      }
      await this.recordSlipVerification({ qrcode_data, slipData, orderId });

      return {
        success: true,
        data: res.data,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          reason: error?.response?.data || null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async recordSlipVerification({
    qrcode_data,
    slipData,
    orderId,
  }: {
    qrcode_data: string;
    slipData: any;
    orderId: string;
  }) {
    await this.db.insert(slipVerifications).values({
      slipCode: qrcode_data,
      ref: slipData.ref,
      senderBank: slipData.sender_bank,
      senderName: slipData.sender_name,
      senderId: slipData.sender_id,
      receiverBank: slipData.receiver_bank,
      receiverName: slipData.receiver_name,
      receiverId: slipData.receiver_id,
      amount: slipData.amount,
      orderId: orderId,
      status: true,
    });
  }
}
