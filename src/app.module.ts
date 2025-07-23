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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    UsersModule,
    AuthModule,
    DatabaseModule,

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
  providers: [],
})
export class AppModule {}
