import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstructionSitesService } from './construction_sites.service';
import { ConstructionSitesController } from './construction_sites.controller';
import { ConstructionSite, ConstructionSiteSchema } from './Schemas/Construction_Site.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConstructionSite.name, schema: ConstructionSiteSchema }
    ]),
  ],
  controllers: [ConstructionSitesController],
  providers: [ConstructionSitesService],
  exports: [ConstructionSitesService],
})
export class ConstructionSitesModule {}