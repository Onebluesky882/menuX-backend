import { Test, TestingModule } from '@nestjs/testing';
import { OrderTableController } from './order-table.controller';

describe('OrderTableController', () => {
  let controller: OrderTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderTableController],
    }).compile();

    controller = module.get<OrderTableController>(OrderTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
