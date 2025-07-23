import { Module } from '@nestjs/common';
import { MenuOptionsService } from './menu_options.service';
import { MenuOptionsController } from './menu_options.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MenuOptionsService],
  controllers: [MenuOptionsController],
})
export class MenuOptionsModule {}
