import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostSlipDto, SlipVerify } from './slip-verifications.dto';
import { SlipVerificationsService } from './slip-verifications.service';

@Controller('slip-verifications')
export class SlipVerificationsController {
  constructor(
    private readonly slipVerificationsService: SlipVerificationsService,
  ) {}
  @Post()
  post(@Body() body: SlipVerify) {
    return this.slipVerificationsService.slipVerification(body);
  }
  @Post('shop')
  shop(@Body() body: PostSlipDto) {
    return this.slipVerificationsService.shopCheckAccount(body);
  }

  @Get(':orderId')
  getSuccess(@Param('orderId') orderId: string) {
    return this.slipVerificationsService.getSuccess(orderId);
  }
}
