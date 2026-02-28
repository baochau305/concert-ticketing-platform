import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh() {
    return { message: 'Token refreshed successfully' };
  }
}
