import { UserService } from '@/user/application/user.service';
import { User } from '@/user/domain/user.entity';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _userService: UserService,
    private readonly _configService: ConfigService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
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
    const accessToken = await this._jwtService.signAsync(payload, {
      expiresIn: this._configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
    const refreshToken = await this._jwtService.signAsync(payload, {
      expiresIn: this._configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async signUp(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
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
    const accessToken = await this._jwtService.signAsync(payload, {
      expiresIn: this._configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
    const refreshToken = await this._jwtService.signAsync(payload, {
      expiresIn: this._configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(
    token: string,
  ): Promise<{ refresh_token: string; access_token: string }> {
    let payload: any;

    try {
      payload = this._jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this._userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedPayload = { sub: user.id };
    const accessToken = await this._jwtService.signAsync(updatedPayload, {
      expiresIn: this._configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
    const refreshToken = await this._jwtService.signAsync(updatedPayload, {
      expiresIn: this._configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
