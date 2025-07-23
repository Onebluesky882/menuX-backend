import { Test, TestingModule } from '@nestjs/testing';
import { OrderTableService } from './order-table.service';

describe('OrderTableService', () => {
  let service: OrderTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderTableService],
    }).compile();

    service = module.get<OrderTableService>(OrderTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
