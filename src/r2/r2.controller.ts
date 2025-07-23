import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { R2Service } from './r2.service';
import { ImagesService } from 'src/images/images.service';
import { ImageDto } from '../images/images.dto';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';

@Controller('r2')
export class R2Controller {
  constructor(
    private readonly r2Service: R2Service,
    private readonly imagesService: ImagesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async upload(@Req() req: FastifyRequest) {
    const parts = req.parts();
    let file: MultipartFile | undefined;
    let body: Record<string, string> = {};

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'file') {
        file = part as MultipartFile;
      } else if (part.type === 'field') {
        body[part.fieldname] = part.value as string;
      }
    }

    if (!file) throw new Error('File not provided');

    const userId = (req as any).user.id; // Cast AuthGuard result (no built-in typing)
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
