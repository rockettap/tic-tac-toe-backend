import { UserService } from '@/user/application/user.service';
import { User } from '@/user/domain/user.entity';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _userService: UserService,
  ) {}

  async signIn(email: string, password: string): Promise<object> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const user = await this._userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id };
    return { access_token: await this._jwtService.signAsync(payload) };
  }

  async signUp(email: string, password: string): Promise<object> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const user = await this._userService.findByEmail(email);
    if (user) {
      throw new UnauthorizedException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await this._userService.create(
      new User('', email, passwordHash),
    );

    const payload = { sub: createdUser.id };
    return { access_token: await this._jwtService.signAsync(payload) };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
