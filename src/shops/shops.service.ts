import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, shops } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';
import { InsertShop } from './shops.dto';

@Injectable()
export class ShopsService {
  private readonly logger = new Logger(ShopsService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getOwnerShop(userId: string) {
    return this.db.query.shops.findFirst({ where: eq(shops.ownerId, userId) });
  }

  async create(dto: InsertShop, userId: string) {
    try {
      const inserted = await this.db
        .insert(shops)
        .values({ ...dto, ownerId: userId, active: true })
        .returning();
      return {
        success: true,
        data: inserted,
      };
    } catch (error) {
      this.logger.error('Failed to create shop', error);
      if (error === '23505') {
        throw new HttpException(
          { success: false, message: 'shop already exists.' },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the shop.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAll(userId: string) {
    try {
      const result = await this.db
        .select({
          id: shops.id,
          name: shops.name,
          ownerId: shops.ownerId,
          updatedAt: shops.updatedAt,
          active: shops.active,
        })
        .from(shops)
        .where(eq(shops.ownerId, userId));
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch shop',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllShopNoJWT() {
    try {
      const result = await this.db
        .select({
          id: shops.id,
          name: shops.name,
          active: shops.active,
        })
        .from(shops)
        .where(eq(shops.active, true));
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch shop',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: string) {
    try {
      const result = await this.db
        .select({
          id: shops.id,
          name: shops.name,
          ownerId: shops.ownerId,
          updatedAt: shops.updatedAt,
          active: shops.active,
        })
        .from(shops)
        .where(and(eq(shops.id, id)));

      if (!result.length) {
        throw new NotFoundException(`Shop with ID ${id} not found`);
      }
      return {
        data: result[0],
        success: true,
      };
    } catch (error) {
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

  async update(id: string, body: InsertShop) {
    try {
      const updated = await this.db
        .update(shops)
        .set(body)
        .where(eq(shops.id, id))
        .returning();
      return {
        data: updated,
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: ' fail to update shop ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
