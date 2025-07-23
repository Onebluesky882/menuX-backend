import { Test, TestingModule } from '@nestjs/testing';
import { LineUsersService } from './line_users.service';

describe('LineUsersService', () => {
  let service: LineUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LineUsersService],
    }).compile();

    service = module.get<LineUsersService>(LineUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
