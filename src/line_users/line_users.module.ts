import { Module } from '@nestjs/common';
import { LineUsersService } from './line_users.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [LineUsersService],
  exports: [LineUsersService],
})
export class LineUsersModule {}
