import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { images } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';
import { ImageDto } from './images.dto';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  async postImage(data: ImageDto, userId: string) {
    try {
      const result = await this.db
        .insert(images)
        .values({ ...data, userId: userId })
        .returning();
      console.log('result image service : ', result);
      return {
        status: 'success',
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch image',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getShopImages(data: Pick<ImageDto, 'shopId' | 'type'>) {
    try {
      const result = await this.db
        .select()
        .from(images)
        .where(
          and(eq(images.shopId, data.shopId!), eq(images.type, data.type)),
        );

      return {
        success: true,
        message: 'Fetched all image successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch image',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfileImages(data: Pick<ImageDto, 'type'>, userId: string) {
    try {
      const result = await this.db.select().from(images);
      and(eq(images.userId, userId!), eq(images.type, data.type));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch image',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getMenuImages(shopId: string, type: string) {
    try {
      const result = await this.db
        .select({ id: images.id, url: images.imageUrl, menuId: images.menuId })
        .from(images)
        .where(
          and(eq(images.shopId, shopId), eq(images.type, (type = 'menu'))),
        );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch image',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: string) {
    const result = await this.db.select().from(images).where(eq(images.id, id));
    if (!result) throw new NotFoundException();
    return {
      data: result,
      success: true,
    };
  }
  catch(error) {
    this.logger.error(error);
    throw new HttpException(
      {
        success: false,
        message: 'unable to fetch by id',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
