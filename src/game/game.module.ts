import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/application/user.service';
import { MongoUserRepository } from 'src/user/infrastructure/repositories/user.repository';
import { UserSchema } from 'src/user/infrastructure/schemas/user.schema';
import { GameService } from './application/game.service';
import { GameController } from './infrastructure/game.controller';
import { MongoGameRepository } from './infrastructure/repositories/game.repository';
import { GameSchema } from './infrastructure/schemas/game.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Game', schema: GameSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [
    GameService,
    UserService,
    {
      provide: 'GameRepository',
      useClass: MongoGameRepository,
    },
    {
      provide: 'UserRepository',
      useClass: MongoUserRepository,
    },
  ],
  controllers: [GameController],
  exports: [GameService, 'GameRepository'],
})
export class GameModule {}
