import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tableGridLayout } from 'src/database';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';
import {
  InsertTableGridLayout,
  UpdateTableGridLayout,
} from './table-grid-layout.dto';

@Injectable()
export class TableGridLayoutService {
  private readonly logger = new Logger(TableGridLayoutService.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  async create(newTableLayout: InsertTableGridLayout, shopId: string) {
    try {
      const inserted = await this.db
        .insert(tableGridLayout)
        .values({ ...newTableLayout, shopId: shopId })
        .returning();
      return {
        success: true,
        message: 'create Table GridLayout successfully',
        data: inserted,
      };
    } catch (error) {
      this.logger.error('Failed to create table', error);
      if (error === '23505') {
        throw new HttpException(
          { success: false, message: ' Table GridLayout already exists.' },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the Table GridLayout.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAll(shopId: string) {
    try {
      const result = await this.db
        .select({
          shopId: tableGridLayout.shopId,
          columns: tableGridLayout.columns,
          rows: tableGridLayout.rows,
        })
        .from(tableGridLayout)
        .where(and(eq(tableGridLayout.shopId, shopId)));

      return {
        success: true,
        message: 'Fetched all Table GridLayout successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch table layout',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: string, shopId: string) {
    try {
      const result = await this.db
        .select({
          columns: tableGridLayout.columns,
          rows: tableGridLayout.rows,
        })
        .from(tableGridLayout)
        .where(
          and(eq(tableGridLayout.id, id), eq(tableGridLayout.shopId, shopId)),
        );
      return {
        data: result[0],
        success: true,
        message: 'Fetched Table GridLayout by ID successfully',
      };
    } catch (error) {
      this.logger.error('Failed to fetch table layout by ID', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch table layout by ID',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, body: UpdateTableGridLayout, shopId: string) {
    try {
      const updated = await this.db
        .update(tableGridLayout)
        .set(body)
        .where(
          and(eq(tableGridLayout.id, id), eq(tableGridLayout.shopId, shopId)),
        )
        .returning();
      return {
        data: updated,
        success: true,
        message: ' updated Table GridLayout success ',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: ' fail to update Table GridLayout ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async delete(id: string, shopId: string) {
    try {
      await this.db
        .delete(tableGridLayout)
        .where(
          and(eq(tableGridLayout.id, id), eq(tableGridLayout.shopId, shopId)),
        )
        .returning();
      return {
        success: true,
        message: 'Table GridLayout deleted successfully',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        {
          success: false,
          message: 'Fail delete Table GridLayout',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
