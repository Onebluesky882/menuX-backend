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
import { schema, shops, slipVerifications } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { orders } from '../database/schema/orders';
import { PostSlipDto } from './slip-verifications.dto';
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

  async recordSlipVerification({ amount, qrcode_data, orderId }: PostSlipDto) {
    const url = `https://ucwgwgkko4wk408ggsk0cosw.oiio.download/api/slip/${amount}/no_slip`;

    try {
      const res = await firstValueFrom(this.http.post(url, { qrcode_data }));
      const slipData = res.data.data;

      const order = await this.db.query.orders.findFirst({
        where: eq(orders.id, orderId!),
      });
      if (!order) {
        return;
      }

      const shop = await this.db.query.shops.findFirst({
        where: eq(shops.id, order?.shopId!),
      });

      if (Number(slipData.amount) !== Number(order.totalPrice)) {
        throw new BadRequestException('Amount mismatch');
      }

      if (shop?.receiveBank !== slipData.receiver_bank) {
        throw new BadRequestException('Receiver bank mismatch');
      }

      const insertData = await this.db
        .insert(slipVerifications)
        .values({
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
        })
        .returning();
      return {
        success: true,
        data: insertData,
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
}
