import {
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from './r2.service';
import { ImagesService } from 'src/images/images.service';
import { ImageDto } from '../images/images.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

@Controller('r2')
export class R2Controller {
  constructor(
    private readonly r2Service: R2Service,
    private readonly imagesService: ImagesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { type: string; menuId: string; shopId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new Error('File not provided');
    }

    const userId = req.user.id;
    const result = await this.r2Service.uploadFile(file);

    const image: ImageDto = {
      type: body.type,
      imageUrl: result,
      menuId: body.menuId,
      shopId: body.shopId,
    };

    const picture = await this.imagesService.postImage(image, userId);
    console.log(picture);

    return { success: true, url: result };
  }
}
