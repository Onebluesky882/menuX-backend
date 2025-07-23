import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { DatabaseModule } from 'src/database/database.module';
import { ImagesController } from './images.controller';

@Module({
  // ImageAccessGuard to do later
  imports: [DatabaseModule],
  providers: [ImagesService],
  exports: [ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}
