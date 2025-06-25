import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './application/user.service';
import { MongoUserRepository } from './infrastructure/repositories/user.repository';
import { UserSchema } from './infrastructure/schemas/user.schema';
import { UserController } from './infrastructure/user.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: MongoUserRepository,
    },
  ],
  controllers: [UserController],
  exports: [UserService, 'UserRepository'],
})
export class UserModule {}
