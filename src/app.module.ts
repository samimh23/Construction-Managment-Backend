
  import { Module  } from '@nestjs/common';
  import { AppController } from './app.controller';
  import { AppService } from './app.service';


  import { UsersModule } from './users/users.module';
  import { ConfigModule, ConfigService } from '@nestjs/config';
  import config from './config/config';
  import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConstructionSitesModule } from './construction_sites/construction_sites.module';
import { AuthModule } from './auth/auth.module';
import { AttendenceModule } from './attendence/attendence.module';
import { LocationModule } from './Locator/location.module';

  @Module({
    imports: [ConfigModule.forRoot({
      isGlobal:true,
      cache:true,
      load:[config]
    }),
    MongooseModule.forRootAsync({ 
      imports:[ConfigModule],
      useFactory:async(configService:ConfigService)=>({
          uri: configService.get<string>('database.connectionString'),
      }),
      inject:[ConfigService]


    }),
    JwtModule.registerAsync({
      global: true, 
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return {
          secret: secret,
          signOptions: { 
            expiresIn: configService.get<string>('jwt.expiresIn') 
          },
        };
      },
      inject: [ConfigService],
    })

      ,AuthModule, UsersModule,ConstructionSitesModule, AttendenceModule, LocationModule],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}

