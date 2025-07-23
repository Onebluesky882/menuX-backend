import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { and, eq } from 'drizzle-orm';
import { menus, schema, shops } from 'src/database';
import { MenuDto } from './menus.dto';

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(dto: MenuDto, userId: string) {
    try {
      const newMenu = await this.db
        .insert(menus)
        .values({ ...dto, createdBy: userId, available: true })
        .returning();
      return {
        success: true,
        data: newMenu,
      };
    } catch (error) {
      this.logger.error('Failed to create menu', error);

      // 23505 = unique_violation in Postgres
      if (error === '23505') {
        throw new HttpException(
          {
            success: false,
            message: 'A menu with this name already exists in the shop.',
          },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the menu.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAll(shopId: string) {
    try {
      const result = await this.db
        .select({
          id: menus.id,
          name: menus.name,
          price: menus.price,
          available: menus.available,
          shopId: menus.shopId,
        })
        .from(menus)
        .where(eq(menus.shopId, shopId));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger?.error?.('Failed to fetch available menus:', error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch menu',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getByName(name: string, shopId: string) {
    try {
      const result = await this.db
        .select({
          name: menus.name,
          price: menus.price,
          available: menus.available,
          createdBy: menus.createdBy,
          shopId: menus.shopId,
        })
        .from(menus)
        .where(and(eq(menus.name, name), eq(menus.shopId, shopId)));
      return {
        data: result[0],
        success: true,
        status: 'success',
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

  async getMenusWithDetailsByShopId(shopId: string) {
    try {
      const menuWithRelations = await this.db.query.menus.findMany({
        where: eq(menus.shopId, shopId),
        with: {
          images: true,
          menuOptions: true,
        },
      });
      console.log('🍜 menuWithRelations', menuWithRelations);
      return menuWithRelations;
    } catch (error) {
      console.error('❌ Failed to get menus with relations', error);
    }
  }

  async update(id: string, body: MenuDto, shopId: string) {
    try {
      const updated = await this.db
        .update(menus)
        .set(body)
        .where(and(eq(menus.id, id), eq(menus.shopId, shopId)))
        .returning();
      return {
        data: updated,
        success: true,
        message: ' updated menu success ',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: ' fail to update menu ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async delete(id: string, shopId: string) {
    try {
      await this.db
        .delete(menus)
        .where(and(eq(menus.id, id), eq(menus.shopId, shopId)))
        .returning();
      return {
        success: true,
        message: 'menu deleted successfully',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'Fail delete menu',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
