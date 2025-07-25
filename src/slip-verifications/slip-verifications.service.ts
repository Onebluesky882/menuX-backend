import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { firstValueFrom } from 'rxjs';
import { PostSlipDto } from './slip-verifications.dto';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { slipVerifications } from 'src/database';
@Injectable()
export class SlipVerificationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
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

  async postCodeToVerify({ amount, qrcode_data, orderId }: PostSlipDto) {
    const url = `https://ucwgwgkko4wk408ggsk0cosw.oiio.download/api/slip/${amount}/no_slip`;

    try {
      const res = await firstValueFrom(this.http.post(url, { qrcode_data }));
      const slipData = res.data.data;

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
}
