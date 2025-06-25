import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly _jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers['authorization']);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = this._jwtService.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(authorizationHeader: string | undefined): string | null {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return null;
    }
    return authorizationHeader.split(' ')[1];
  }
}
