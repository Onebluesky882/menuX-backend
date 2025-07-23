import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { menus, schema, shops } from 'src/database';
import { menuOptions } from 'src/database/schema/menuOptions';
import { eq } from 'drizzle-orm';
import { MenuOption } from './menu_options.dto';

@Injectable()
export class MenuOptionsService {
  private readonly logger = new Logger(MenuOptionsService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: MenuOption, userId: string) {
    try {
      const shopOwner = await this.db.query.shops.findFirst({
        where: eq(shops.ownerId, userId),
      });
      if (!shopOwner) {
        throw new BadRequestException(
          "You don't have permission to add options.",
        );
      }
      const menuExists = await this.db.query.menus.findFirst({
        where: eq(menus.id, data.menuId!),
      });

      if (!menuExists) {
        throw new BadRequestException('Menu not found');
      }

      const result = await this.db
        .insert(menuOptions)
        .values({
          menuId: data.menuId,
          label: data.label,
          price: data.price,
          available: data.available ?? true,
        })
        .returning();

      return {
        success: true,
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Failed to create menu option:', error);
    }
  }

  async getMenuOptionId(menuId: string) {
    try {
      const result = await this.db.query.menuOptions.findMany({
        where: eq(menus.id, menuId),
      });
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('failed to get getMenuOptionId ', error);
    }
  }
}
