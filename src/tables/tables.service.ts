import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { shopTables } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';
import { TableDto } from './table.dto';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  async create(dto: TableDto, shopId: string, userId: string) {
    try {
      const inserted = await this.db
        .insert(shopTables)
        .values({ ...dto, shopId: shopId, createdById: userId })
        .returning();

      return {
        success: true,
        message: 'create table successfully',
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
          shopId: shopTables.shopId,
          status: shopTables.status,
          createdById: shopTables.createdById,
          layoutId: shopTables.layoutId,
          name: shopTables.name,
          number: shopTables.number,
          position: shopTables.position,
          tableLink: shopTables.tableLink,
        })
        .from(shopTables)
        .where(eq(shopTables.shopId, shopId));
      return {
        success: true,
        message: 'Fetched all shopTables successfully',
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
      const result = await this.db
        .select({
          shopId: shopTables.shopId,
          status: shopTables.status,
          createdById: shopTables.createdById,
          layoutId: shopTables.layoutId,
          name: shopTables.name,
          number: shopTables.number,
          position: shopTables.position,
          tableLink: shopTables.tableLink,
        })
        .from(shopTables)
        .where(and(eq(shopTables.id, id), eq(shopTables.shopId, shopId)));
      return {
        data: result[0],
        success: true,
        message: 'Fetched table by ID successfully',
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

  async update(id: string, body: TableDto, shopId: string) {
    try {
      const updated = await this.db
        .update(shopTables)
        .set(body)
        .where(and(eq(shopTables.id, id), eq(shopTables, shopId)))
        .returning();
      return {
        data: updated,
        success: true,
        message: ' updated table success ',
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
        .delete(shopTables)
        .where(and(eq(shopTables.id, id), eq(shopTables.shopId, shopId)))
        .returning();
      return {
        success: true,
        message: 'Table deleted successfully',
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
