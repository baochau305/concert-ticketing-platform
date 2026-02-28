import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../authorization/roles.guard';
import { Roles } from '../authorization/roles.decorator';
import { RoleName } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permissions.guard';
import { Permissions } from '../authorization/permissions.decorator';
import { PermissionName } from '../authorization/permission.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../authorization/auth.types';
import { Request } from 'express';

type AuthRequest = Request & {
  user: AuthenticatedUser;
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Permissions(PermissionName.USER_CREATE)
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    if (!this.isAdmin(req.user) && req.user.userId !== id) {
      throw new ForbiddenException('Cannot view other user profile');
    }

    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @Req() req: AuthRequest,
  ) {
    const isAdmin = this.isAdmin(req.user);

    if (!isAdmin && req.user.userId !== id) {
      throw new ForbiddenException('Cannot update other user profile');
    }

    if (body.password) {
      throw new ForbiddenException(
        'Use /users/change-password for password changes',
      );
    }

    if (body.roles?.length && !isAdmin) {
      throw new ForbiddenException('Only admin can update roles');
    }

    return this.usersService.update(id, body, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { oldPassword: string; newPassword: string },
    @Req() req: AuthRequest,
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return (
      user.roles.includes(RoleName.ADMIN) ||
      user.roles.includes(RoleName.SUPER_ADMIN)
    );
  }
}
