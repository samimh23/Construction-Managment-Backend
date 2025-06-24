import { Module } from '@nestjs/common';
import { ConstructionSitesService } from './construction_sites.service';
import { ConstructionSitesController } from './construction_sites.controller';

@Module({
  controllers: [ConstructionSitesController],
  providers: [ConstructionSitesService],
})
export class ConstructionSitesModule {}
