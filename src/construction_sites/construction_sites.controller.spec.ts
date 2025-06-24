import { Test, TestingModule } from '@nestjs/testing';
import { ConstructionSitesController } from './construction_sites.controller';
import { ConstructionSitesService } from './construction_sites.service';

describe('ConstructionSitesController', () => {
  let controller: ConstructionSitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstructionSitesController],
      providers: [ConstructionSitesService],
    }).compile();

    controller = module.get<ConstructionSitesController>(ConstructionSitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
