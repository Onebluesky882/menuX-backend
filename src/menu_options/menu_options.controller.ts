import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MenuOptionsService } from './menu_options.service';
import { MenuOption } from './menu_options.dto';
import { AuthRequest } from 'types/auth';
import { AuthGuard } from '@nestjs/passport';

@Controller('menu-options')
export class MenuOptionsController {
  constructor(private readonly menuOptionsService: MenuOptionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createMenuOptionDto: MenuOption, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.menuOptionsService.create(createMenuOptionDto, userId);
  }

  @Get('/:menuId')
  getMenu(@Param('shopId') menuId: string) {
    return this.menuOptionsService.getMenuOptionId(menuId);
  }
}
