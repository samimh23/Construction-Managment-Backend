import { Module } from '@nestjs/common';
import { AttendanceService } from './attendence.service';
import { AttendanceController } from './attendence.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkSession, WorkSessionSchema } from './schema/work_session.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { ConstructionSite, ConstructionSiteSchema } from 'src/construction_sites/Schemas/Construction_Site.schema';


@Module({

  imports: [
      MongooseModule.forFeature([{ name: WorkSession.name, schema: WorkSessionSchema }
        ,{ name: User.name, schema: UserSchema },
        { name: ConstructionSite.name, schema: ConstructionSiteSchema }
      ])
    ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendenceModule {}
