import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user-repository.inferface';
import { User } from '../domain/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository') private readonly _userRepository: UserRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this._userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this._userRepository.findByEmail(email);
  }

  async create(user: User): Promise<User | null> {
    return await this._userRepository.create(user);
  }
}
