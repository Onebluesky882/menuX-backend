import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OrdersService } from './orders.service';

@Module({
  imports: [DatabaseModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
