import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { orderTable } from 'src/database';
import { eq, and } from 'drizzle-orm';
import { OrderTableDto } from './order-table.dto';
import { DATABASE_CONNECTION } from 'src/database/database-connection';

@Injectable()
export class OrderTableService {
  private readonly logger = new Logger(OrderTableService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  async create(dto: OrderTableDto, shopId: string, userId: string) {
    try {
      const inserted = await this.db
        .insert(orderTable)
        .values({ ...dto, shopId: shopId, createdById: userId })
        .returning();

      return {
        success: true,
        data: inserted,
      };
    } catch (error) {
      this.logger.error('Failed to create table', error);
      if (error === '23505') {
        throw new HttpException(
          { success: false, message: 'Table already exists.' },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the table.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAll(shopId: string) {
    try {
      const result = await this.db
        .select({
          customersId: orderTable.customersId,
          shareToken: orderTable.token,
          shopId: orderTable.shopId,
          status: orderTable.status,
          tableId: orderTable.tableId,
          updatedAt: orderTable.updatedAt,
          createdById: orderTable.createdById,
        })
        .from(orderTable)
        .where(eq(orderTable.shopId, shopId));
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'failed fetch table',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: string, shopId: string) {
    try {
      const shop = await this.db
        .select({ shopId: orderTable.shopId })
        .from(orderTable)
        .where(and(eq(orderTable.id, id), eq(orderTable.shopId, shopId)));
      if (shop.length === 0) {
        throw new HttpException(
          'You do not have permission to access this table.',
          HttpStatus.NOT_FOUND,
        );
      }

      const result = await this.db
        .select({ id: orderTable.id })
        .from(orderTable)
        .where(eq(orderTable.id, id));
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

  async update(id: string, body: OrderTableDto, shopId: string) {
    try {
      const updated = await this.db
        .update(orderTable)
        .set(body)
        .where(and(eq(orderTable.id, id), eq(orderTable, shopId)))
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
          message: ' fail to update table ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async delete(id: string, shopId: string) {
    try {
      await this.db
        .delete(orderTable)
        .where(and(eq(orderTable.id, id), eq(orderTable.shopId, shopId)))
        .returning();
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'Fail delete Table',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
