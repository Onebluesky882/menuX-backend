import { Test, TestingModule } from '@nestjs/testing';
import { MenuOptionsController } from './menu_options.controller';

describe('MenuOptionsController', () => {
  let controller: MenuOptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuOptionsController],
    }).compile();

    controller = module.get<MenuOptionsController>(MenuOptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
