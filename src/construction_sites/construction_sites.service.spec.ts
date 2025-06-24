import { Test, TestingModule } from '@nestjs/testing';
import { ConstructionSitesService } from './construction_sites.service';

describe('ConstructionSitesService', () => {
  let service: ConstructionSitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConstructionSitesService],
    }).compile();

    service = module.get<ConstructionSitesService>(ConstructionSitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
