import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    AuthModule,
    GameModule,
    RoomModule,
    UserModule,
  ],
  // controllers: [AppController],
  // providers: [AppService]
})
export class AppModule {}
