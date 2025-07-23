import { Test, TestingModule } from '@nestjs/testing';
import { TableGridLayoutController } from './table-grid-layout.controller';

describe('TableGridLayoutController', () => {
  let controller: TableGridLayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableGridLayoutController],
    }).compile();

    controller = module.get<TableGridLayoutController>(TableGridLayoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
