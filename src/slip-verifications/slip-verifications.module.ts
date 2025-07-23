import { Module } from '@nestjs/common';
import { SlipVerificationsController } from './slip-verifications.controller';
import { HttpModule } from '@nestjs/axios';
import { SlipVerificationsService } from './slip-verifications.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [SlipVerificationsController],
  providers: [SlipVerificationsService],
})
export class SlipVerificationsModule {}
