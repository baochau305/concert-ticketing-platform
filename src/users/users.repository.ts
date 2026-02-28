import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  save(user: User) {
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find({
      relations: {
        roles: true,
      },
    });
  }

  findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: {
        roles: true,
      },
    });
  }

  findByIdWithAuthorization(id: number) {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.id = :id', { id })
      .getOne();
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByEmailWithAuthorization(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email })
      .getOne();
  }

  update(id: number, data: Partial<User>) {
    return this.repo.update(id, data);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
