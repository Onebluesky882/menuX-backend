import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TablesModule } from './tables/tables.module';
import { ImagesModule } from './images/images.module';
import { OrdersModule } from './orders/orders.module';
import { TableGridLayoutModule } from './table-grid-layout/table-grid-layout.module';
import { MenusModule } from './menus/menus.module';
import { OrderTableModule } from './order-table/order-table.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { LineUsersModule } from './line_users/line_users.module';
import { ShopsModule } from './shops/shops.module';
import { R2Module } from './r2/r2.module';
import { MenuOptionsModule } from './menu_options/menu_options.module';
import { SlipVerificationsModule } from './slip-verifications/slip-verifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseExceptionFilter } from './database/database-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(), // ต้องมาก่อน DatabaseModule
    DatabaseModule, // DatabaseModule จะจัดการ health service เอง
    UsersModule,
    AuthModule,
    TablesModule,
    ImagesModule,
    OrdersModule,
    TableGridLayoutModule,
    MenusModule,
    OrderTableModule,
    OrderItemsModule,
    LineUsersModule,
    ShopsModule,
    R2Module,
    MenuOptionsModule,
    SlipVerificationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
})
export class AppModule {}
