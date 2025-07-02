import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodesService } from './codes.service';
import { AccessCode, AccessCodeSchema } from './schemas/acces-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessCode.name, schema: AccessCodeSchema },
    ]),
  ],
  providers: [CodesService],
  exports: [CodesService],
})
export class CodesModule {}