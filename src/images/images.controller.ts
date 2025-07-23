import { Controller, Get, Query } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('menus')
  getAll(@Query('shopId') shopId: string, @Query('type') type: string) {
    return this.imagesService.getMenuImages(shopId, type);
  }
}
