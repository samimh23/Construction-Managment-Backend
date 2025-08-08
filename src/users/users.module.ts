import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { ConstructionSite, ConstructionSiteSchema } from 'src/construction_sites/Schemas/Construction_Site.schema';
import { EmailModule } from 'src/config/email.module';

@Module({
  imports: [EmailModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }
      ,{
        name: ConstructionSite.name,
        schema: ConstructionSiteSchema
      }
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
  
})
export class UsersModule {}
