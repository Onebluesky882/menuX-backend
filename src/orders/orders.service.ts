import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { error } from 'console';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { orderItems, orders, schema } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { slipVerifications } from '../database/schema/slipVerifications';
import type { CreateOrderDto, OrderPurchase } from './orders.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateOrderDto) {
    const { shopId, items } = data;
    const totalQuantity = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0,
    );

    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    const order = await this.db
      .insert(orders)
      .values({
        shopId: shopId,
        quantity: totalQuantity.toString(),
        totalPrice: totalPrice.toString(),
      })
      .returning()
      .then((val) => val[0]);

    const orderItemsToInsert = items.map((item) => ({
      orderId: order.id,
      menuId: item.menuId,
      quantity: item.quantity,
      priceEach: item.priceEach,
      totalPrice: item.totalPrice,
      updatedAt: new Date(),
      optionId: item.optionId,
    }));
    await this.db.insert(orderItems).values(orderItemsToInsert);
    return {
      success: true,
      data: order,
    };
  }

  async getOrderById(id: string) {
    try {
      const order = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, id));

      return {
        data: order,
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

  // todo section 2
  // redirect consumer to. order/purchase/id

  // for consumer side
  async updateOrderPurchase(orderId: string, body: OrderPurchase) {
    const orderPurchase = await this.db.query.slipVerifications.findFirst({
      where: eq(slipVerifications.orderId, orderId),
    });
    if (!orderPurchase) {
      throw error('no order purchase');
    }
    return this.db
      .update(orders)
      .set({ ...body, status: 'paid' })
      .where(eq(orders.id, orderId))
      .returning();
  }

  // for shop side get status update #3
  // #3 shop see order status paid
  // after shop check orderItem done all than change order status to be done too
  async getOrderPurchase(orderId: string) {
    try {
      const orderPurchase = await this.db.query.orders.findMany({
        where: eq(orders.id, orderId),
        columns: {
          id: true,
          status: true,
          quantity: true,
          totalPrice: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          shop: {
            columns: {
              name: true,
            },
          },
          orderItems: {
            columns: {
              id: true,
              quantity: true,
              priceEach: true,
              totalPrice: true,
              status: true,
            },
            with: {
              menu: {
                columns: {
                  name: true,
                  price: true,
                },
              },
              menuOption: {
                columns: {
                  label: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      return {
        data: orderPurchase,
      };
    } catch (error) {
      console.error('❌ Failed to get menus with relations', error);
    }
  }
}
