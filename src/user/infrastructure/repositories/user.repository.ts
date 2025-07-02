import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from '../../domain/user-repository.inferface';
import { User } from '../../domain/user.entity';
import { UserModel } from '../schemas/user.schema';

export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel('User') private readonly _userModel: Model<UserModel>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userDoc = await this._userModel.findById(id);
    return userDoc
      ? new User(userDoc.id, userDoc.email, userDoc.passwordHash)
      : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this._userModel.findOne({ email });
    return userDoc
      ? new User(userDoc.id, userDoc.email, userDoc.passwordHash)
      : null;
  }

  async create(user: User): Promise<User> {
    const createdUser = new this._userModel({
      email: user.email,
      passwordHash: user.passwordHash,
    });
    const savedUser = await createdUser.save();
    return new User(savedUser.id, savedUser.email, savedUser.passwordHash);
  }

  async update(user: User): Promise<User | null> {
    const updatedUser = await this._userModel
      .findByIdAndUpdate(
        user.id,
        {
          email: user.email,
          passwordHash: user.passwordHash,
        },
        { new: true },
      )
      .exec();
    return updatedUser
      ? new User(updatedUser.id, updatedUser.email, updatedUser.passwordHash)
      : null;
  }
}
