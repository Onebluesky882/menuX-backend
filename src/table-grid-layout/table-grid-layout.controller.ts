import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { TableGridLayoutService } from './table-grid-layout.service';
import { InsertTableGridLayout } from './table-grid-layout.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('table-grid-layout')
export class TableGridLayoutController {
  constructor(private readonly tableGridLayout: TableGridLayoutService) {}

  // @UseGuards(ShopAccessGuard)
  @Post()
  async create(
    @Body() body: InsertTableGridLayout,
    @Query('shopId') shopId: string,
  ) {
    return this.tableGridLayout.create(body, shopId);
  }
  //getAll
  // @UseGuards(ShopAccessGuard)
  @Get()
  async getAll(@Query('shopId') shopId: string) {
    return this.tableGridLayout.getAll(shopId);
  }
  // get by id
  // @UseGuards(ShopAccessGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Query('shopId') shopId: string) {
    return this.tableGridLayout.getById(id, shopId);
  }

  // update
  // @UseGuards(ShopAccessGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: InsertTableGridLayout,
    @Query('shopId') shopId: string,
  ) {
    return this.tableGridLayout.update(id, body, shopId);
  }

  // delete
  // @UseGuards(ShopAccessGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Query('shopId') shopId: string) {
    return this.tableGridLayout.delete(id, shopId);
  }
}
