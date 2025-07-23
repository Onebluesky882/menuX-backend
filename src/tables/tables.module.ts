import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TablesService } from './tables.service';

@Module({
  imports: [DatabaseModule],
  providers: [TablesService],
  controllers: [TablesController],
})
export class TablesModule {}
