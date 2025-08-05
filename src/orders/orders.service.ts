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
  async getOrderPurchase() {
    const orderPurchase = await this.db
      .select({
        // Order fields
        orderId: orders.id,
        orderStatus: orders.status,
        orderCreatedAt: orders.createdAt,
        orderTotalAmount: orders.totalPrice,
        orderShopId: orders.shopId,
        // Add any other order fields you need

        // OrderItem fields
        itemId: orderItems.id,
        itemMenuId: orderItems.menuId,
        itemQuantity: orderItems.quantity,
        itemPriceEach: orderItems.priceEach,
        itemTotalPrice: orderItems.totalPrice,
        // Add any other orderItem fields you need
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.status, 'paid'));

    // array data with orderItems join
    const grouped = new Map();
    for (const row of orderPurchase) {
      const orderId = row.orderId;

      if (!grouped.has(orderId)) {
        grouped.set(orderId, {
          id: row.orderId,
          status: row.orderStatus,
          createdAt: row.orderCreatedAt,
          totalAmount: row.orderTotalAmount,
          // Add other order fields...
          orderItems: [],
        });
      }

      if (row.itemId) {
        grouped.get(orderId).orderItems.push({
          id: row.itemId,
          menuId: row.itemMenuId,
          quantity: row.itemQuantity,
          priceEach: row.itemPriceEach,
        });
      }
    }

    return {
      data: Array.from(grouped.values()),
    };
  }
}
