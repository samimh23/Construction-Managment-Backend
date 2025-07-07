import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CodesService } from 'src/codes/codes.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private codesService: CodesService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Make sure findByEmail exists on UsersService
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject ? user.toObject() : user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    // Create refresh token
    const refreshPayload = { sub: user._id };
    const refresh_token = this.jwtService.sign(
      refreshPayload,
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }
    );

    // Save refresh token to user (make sure updateRefreshToken exists)
    await this.usersService.updateRefreshToken(user._id, refresh_token);

    return {
      access_token,
      refresh_token,
      user,
    };
  }


  async refreshToken(userId: string, refreshToken: string) {
    // Make sure findById exists on UsersService
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access Denied');

    // Check if refresh token is valid and matches
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Optionally, verify the refresh token using JWT
    try {
      this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    } catch (e) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    // Generate new access token
    const payload = { email: user.email, sub: user._id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return {
      access_token: newAccessToken,
    };
  }
}