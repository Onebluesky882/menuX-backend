import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { OrderTableDto } from './order-table.dto';
import { OrderTableService } from './order-table.service';
@UseGuards(AuthGuard('jwt'))
@Controller('order-table')
export class OrderTableController {
  constructor(private readonly orderTableService: OrderTableService) {}
  // @UseGuards(ShopAccessGuard)
  //create
  @Post('/:shopId/order-table')

  //getAll
  // @UseGuards(ShopAccessGuard)
  @Get()
  getAll(@Query('shopId') shopId: string) {
    return this.orderTableService.getAll(shopId);
  }
  // get by id
  // @UseGuards(ShopAccessGuard)
  @Get(':id')
  getById(@Param('id') id: string, @Query('shopId') shopId: string) {
    return this.orderTableService.getById(id, shopId);
  }

  // update
  // @UseGuards(ShopAccessGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: OrderTableDto,
    @Query('shopId') shopId: string,
  ) {
    return this.orderTableService.update(id, body, shopId);
  }

  // delete
  // @UseGuards(ShopAccessGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Query('shopId') shopId: string) {
    return this.orderTableService.delete(id, shopId);
  }
}
