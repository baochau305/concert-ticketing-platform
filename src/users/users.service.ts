import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleName } from '../authorization/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(data: CreateUserDto) {
    const existed = await this.usersRepo.findByEmail(data.email);
    if (existed) {
      throw new ConflictException('Email already exists');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const roleNames = data.roles?.length
      ? Array.from(new Set(data.roles))
      : [RoleName.CUSTOMER];
    const roles = await this.roleRepository.find({
      where: { name: In(roleNames) },
    });

    if (roles.length !== roleNames.length) {
      throw new BadRequestException('Invalid role list');
    }

    const user = await this.usersRepo.create({
      ...data,
      password: hashed,
      roles,
    });

    return this.toPublicUser(user);
  }

  async findAll() {
    const users = await this.usersRepo.findAll();
    return users.map((user) => this.toPublicUser(user));
  }

  async findById(id: number) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async update(id: number, data: UpdateUserDto, isAdmin: boolean) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existed = await this.usersRepo.findByEmail(data.email);
      if (existed && existed.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updates: Partial<User> = {
      name: data.name,
      email: data.email,
    };

    if (isAdmin && data.roles?.length) {
      const roleNames = Array.from(new Set(data.roles));
      const roles = await this.roleRepository.find({
        where: { name: In(roleNames) },
      });
      if (roles.length !== roleNames.length) {
        throw new BadRequestException('Invalid role list');
      }
      user.roles = roles;
    }

    user.name = updates.name ?? user.name;
    user.email = updates.email ?? user.email;

    const saved = await this.usersRepo.save(user);
    return this.toPublicUser(saved);
  }

  async delete(id: number) {
    const result = await this.usersRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
    };
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepo.findByIdWithAuthorization(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 chars');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.update(userId, { password: hashed });

    return {
      message: 'Password changed successfully',
    };
  }

  private toPublicUser(user: User): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
