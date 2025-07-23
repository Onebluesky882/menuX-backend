import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { DatabaseModule } from 'src/database/database.module';
import { ShopsController } from './shops.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ShopsService],
  controllers: [ShopsController],
  exports: [ShopsService],
})
export class ShopsModule {}
