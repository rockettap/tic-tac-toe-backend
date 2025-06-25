import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('login')
  async signIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body || {};
    return this._authService.signIn(email, password);
  }

  @Post('register')
  async signUp(@Body() body: { email: string; password: string }) {
    const { email, password } = body || {};
    return this._authService.signUp(email, password);
  }
}
