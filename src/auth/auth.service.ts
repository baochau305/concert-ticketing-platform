import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../authorization/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepo.findByEmailWithAuthorization(email);
    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const roles = (user.roles ?? []).map((role) => role.name);
    const permissions = Array.from(
      new Set(
        (user.roles ?? [])
          .flatMap((role) => role.permissions ?? [])
          .map((permission) => permission.name),
      ),
    );

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles,
      permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
