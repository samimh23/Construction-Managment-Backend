import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Owner/Manager login (with credentials)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { message: 'Invalid credentials', status: 401 };
    }
    return this.authService.login(user);
  }

  // Tablet login for managers (with code)
  @Post('tablet-login')
  async tabletLogin(@Body() body: { code: string }) {
    return this.authService.tabletLogin(body.code);
  }

  // Refresh token (if your AuthService implements this)
  @Post('refresh')
async refresh(@Body() body: { userId: string; refreshToken: string }) {
  return this.authService.refreshToken(body.userId, body.refreshToken);
}
}