import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { RoomService } from './application/room.service';
import { MongoRoomRepository } from './infrastructure/repositories/room.repository';
import { RoomController } from './infrastructure/room.controller';
import { RoomGateway } from './infrastructure/room.gateway';
import { RoomSchema } from './infrastructure/schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Room', schema: RoomSchema }]),
    AuthModule,
    GameModule,
    UserModule,
  ],
  providers: [
    RoomService,
    RoomGateway,
    {
      provide: 'RoomRepository',
      useClass: MongoRoomRepository,
    },
  ],
  controllers: [RoomController],
  exports: [RoomService, 'RoomRepository'],
})
export class RoomModule {}
