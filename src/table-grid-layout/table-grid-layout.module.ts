import { Module } from '@nestjs/common';
import { TableGridLayoutController } from './table-grid-layout.controller';
import { TableGridLayoutService } from './table-grid-layout.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TableGridLayoutService],
  controllers: [TableGridLayoutController],
})
export class TableGridLayoutModule {}
