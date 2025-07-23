import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { menuOptions, menus, orderItems } from 'src/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class OrderItemsService {
  private readonly logger = new Logger(OrderItemsService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  async getOrderItemsById(orderId: string) {
    try {
      const res = await this.db
        .select({
          orderItemId: orderItems.id,
          orderId: orderItems.orderId,
          menuId: orderItems.menuId,
          quantity: orderItems.quantity,
          priceEach: orderItems.priceEach,
          totalPrice: orderItems.totalPrice,
          createdAt: orderItems.createdAt,
          updatedAt: orderItems.updatedAt,
          status: orderItems.status,
          menuName: menus.name, // join menu name
          optionLabel: menuOptions.label,
        })
        .from(orderItems)

        .leftJoin(menus, eq(orderItems.menuId, menus.id))
        .leftJoin(menuOptions, eq(orderItems.optionId, menuOptions.id))
        .where(eq(orderItems.orderId, orderId));

      return {
        data: res,
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
}
