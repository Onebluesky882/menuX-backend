import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from '../../types/auth';
import { MenuDto } from './menus.dto';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() body: MenuDto, @Req() req: AuthRequest) {
    const userId = req.user.id;

    return this.menusService.create(body, userId);
  }

  @Get()
  getAll(@Query('shopId') shopId: string) {
    return this.menusService.getAll(shopId);
  }
  // get by id
  @Get('name')
  getById(@Query('name') name: string, @Query('shopId') shopId: string) {
    return this.menusService.getByName(name, shopId);
  }

  // update
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: MenuDto,
    @Query('shopId') shopId: string,
  ) {
    return this.menusService.update(id, body, shopId);
  }

  // delete
  @Delete(':id')
  delete(@Param('id') id: string, @Query('shopId') shopId: string) {
    return this.menusService.delete(id, shopId);
  }

  @Get('options/:shopId')
  async getMenuWithDetail(@Param('shopId') shopId: string) {
    return this.menusService.getMenusWithDetailsByShopId(shopId);
  }
}
