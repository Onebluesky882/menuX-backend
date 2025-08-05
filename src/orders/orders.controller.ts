import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { CreateOrderDto, OrderPurchase } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() cartItems: CreateOrderDto) {
    console.log('Received createOrderDto:', cartItems);
    return this.ordersService.create(cartItems);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    console.log('id ', id);
    return this.ordersService.getOrderById(id);
  }

  @Patch('purchase/:id')
  patch(@Param('id') id: string, @Body() body: OrderPurchase) {
    return this.ordersService.updateOrderPurchase(id, body);
  }
}
