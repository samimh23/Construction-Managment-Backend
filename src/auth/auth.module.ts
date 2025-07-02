import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { CodesModule } from 'src/codes/code.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
   imports: [
    UsersModule,    // <-- THIS IS IMPORTANT!
    CodesModule,    // <-- if you use CodesService
    
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
