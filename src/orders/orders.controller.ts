import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { CreateOrderDto, OrderPurchase } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() cartItems: CreateOrderDto) {
    return this.ordersService.create(cartItems);
  }

  @Get('purchases/:shopId')
  getAllPurchases(@Param('shopId') shopId: string) {
    console.log('shopId', shopId);
    return this.ordersService.getAllPurchases(shopId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    console.log('id ', id);
    return this.ordersService.getOrderById(id);
  }

  @Get('purchase/:orderId')
  getOrderPurchaseId(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderPurchaseById(orderId);
  }

  @Patch(':orderId')
  patch(@Param('orderId') orderId: string, @Body() body: OrderPurchase) {
    return this.ordersService.updateOrderPurchase(orderId, body);
  }
}
