import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CodesService } from 'src/codes/codes.service';
import { UserRole } from 'src/users/schema/role.enum';

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
  const user = await this.usersService.findById(userId);
  if (!user || !user.refreshToken) throw new UnauthorizedException('Access Denied');

  if (user.refreshToken !== refreshToken) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  try {
    this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
  } catch (e) {
    throw new UnauthorizedException('Refresh token expired or invalid');
  }

  const payload = { email: user.email, sub: user._id, role: user.role };
  const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

  // Generate a new refresh token
  const refreshPayload = { sub: user._id };
  const newRefreshToken = this.jwtService.sign(
    refreshPayload,
    { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }
  );
await this.usersService.updateRefreshToken(user._id as string, newRefreshToken);
  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
  };
}

async registerOwner(createOwnerDto: any) {
    // Check if user already exists
    const userExists = await this.usersService.findByEmail(createOwnerDto.email);
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createOwnerDto.password, 10);
    
    // Create user object (you'll need to inject User model or call UsersService)
    const userData = {
      firstName: createOwnerDto.firstName,
      lastName: createOwnerDto.lastName,
      email: createOwnerDto.email,
      password: hashedPassword,
      phone: createOwnerDto.phone,
      company: createOwnerDto.company,
      role: UserRole.OWNER, // or UserRole.OWNER
      isActive: true,
    };

    // Create the user
    const user = await this.usersService.createUser(userData); // You'll need this method
    
    // Generate tokens and return login response
    return this.login(user);
  }


} 