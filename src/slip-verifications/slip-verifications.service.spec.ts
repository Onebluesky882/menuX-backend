import { Test, TestingModule } from '@nestjs/testing';
import { SlipVerificationsService } from './slip-verifications.service';

describe('SlipVerificationsService', () => {
  let service: SlipVerificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlipVerificationsService],
    }).compile();

    service = module.get<SlipVerificationsService>(SlipVerificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
