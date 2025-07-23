import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { DatabaseModule } from 'src/database/database.module';
import { MenusController } from './menus.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
