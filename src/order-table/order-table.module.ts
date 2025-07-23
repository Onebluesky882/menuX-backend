import { Module } from '@nestjs/common';
import { OrderTableController } from './order-table.controller';
import { OrderTableService } from './order-table.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderTableController],
  providers: [OrderTableService],
})
export class OrderTableModule {}
