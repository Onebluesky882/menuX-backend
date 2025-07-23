import { Test, TestingModule } from '@nestjs/testing';
import { SlipVerificationsController } from './slip-verifications.controller';

describe('SlipVerificationsController', () => {
  let controller: SlipVerificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlipVerificationsController],
    }).compile();

    controller = module.get<SlipVerificationsController>(SlipVerificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
