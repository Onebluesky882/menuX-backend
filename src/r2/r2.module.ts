import { Module } from '@nestjs/common';
import { R2Controller } from './r2.controller';
import { R2Service } from './r2.service';
import { ImagesModule } from 'src/images/images.module';

@Module({
  imports: [ImagesModule],
  providers: [R2Service],
  controllers: [R2Controller],
  exports: [R2Module],
})
export class R2Module {}
