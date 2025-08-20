import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstructionSitesService } from './construction_sites.service';
import { ConstructionSitesController } from './construction_sites.controller';
import { ConstructionSite, ConstructionSiteSchema } from './Schemas/Construction_Site.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConstructionSite.name, schema: ConstructionSiteSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ConstructionSitesController],
  providers: [ConstructionSitesService],
  exports: [ConstructionSitesService],
})
export class ConstructionSitesModule {}