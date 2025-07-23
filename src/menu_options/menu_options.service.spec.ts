import { Test, TestingModule } from '@nestjs/testing';
import { MenuOptionsService } from './menu_options.service';

describe('MenuOptionsService', () => {
  let service: MenuOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuOptionsService],
    }).compile();

    service = module.get<MenuOptionsService>(MenuOptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
