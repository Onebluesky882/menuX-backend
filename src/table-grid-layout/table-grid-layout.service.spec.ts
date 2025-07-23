import { Test, TestingModule } from '@nestjs/testing';
import { TableGridLayoutService } from './table-grid-layout.service';

describe('TableGridLayoutService', () => {
  let service: TableGridLayoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableGridLayoutService],
    }).compile();

    service = module.get<TableGridLayoutService>(TableGridLayoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
