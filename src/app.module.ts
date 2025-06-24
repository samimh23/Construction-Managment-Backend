import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConstructionSitesModule } from './construction_sites/construction_sites.module';

@Module({
  imports: [ConstructionSitesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
