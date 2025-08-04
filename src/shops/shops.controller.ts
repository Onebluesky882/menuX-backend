import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'types/auth';
import { InsertShop, ReceiveBank } from './shops.dto';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly ShopsService: ShopsService) {}
  //getAll
  // @UseGuards(ShopAccessGuard)

  @Get('consumer')
  getAllShopCLient() {
    return this.ShopsService.getAllShopNoJWT();
  }

  @UseGuards(AuthGuard('jwt'))
  //todo change Get('customer')
  @Get()
  getAll(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.ShopsService.getAll(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':shopId/menu')
  getMenuPage(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.ShopsService.getAll(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  // @Roles('owner')
  create(@Body() body: InsertShop, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.ShopsService.create(body, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getOwnerShop')
  getOwner(@Req() req: AuthRequest) {
    const userId = req.user.id;
    console.log('userId', userId);
    return this.ShopsService.getOwnerShop(userId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.ShopsService.getById(id);
  }

  // update
  @UseGuards(AuthGuard('jwt'))
  @Patch(':shopId')
  async patch(
    @Param('shopId') shopId: string,
    @Body() data: ReceiveBank,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return this.ShopsService.patch(shopId, data, userId);
  }
}
