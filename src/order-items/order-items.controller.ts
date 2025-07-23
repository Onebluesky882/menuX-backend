import { Controller, Get, Param } from '@nestjs/common';

import { OrderItemsService } from './order-items.service';
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get(':orderId')
  getById(@Param('orderId') orderId: string) {
    return this.orderItemsService.getOrderItemsById(orderId);
  }
}
