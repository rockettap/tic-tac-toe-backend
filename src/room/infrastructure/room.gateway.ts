import { forwardRef, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from 'src/game/domain/game.entity';
import { RoomService } from '../application/room.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway {
  @WebSocketServer() server: Server;
  private readonly _sidUserIds: Map<string, string> = new Map();
  private readonly _logger = new Logger(RoomGateway.name);

  constructor(
    private readonly _jwtService: JwtService,
    @Inject(forwardRef(() => RoomService))
    private readonly _roomService: RoomService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;
    if (!token) {
      client.disconnect();
      return;
    }

    const roomId = Array.isArray(client.handshake.query.roomId)
      ? client.handshake.query.roomId[0]
      : client.handshake.query.roomId;
    if (!roomId) {
      client.disconnect();
      return;
    }

    try {
      const { sub: userId } = this._jwtService.verify(token);

      const isAlreadyConnected = Array.from(this._sidUserIds.values()).includes(
        userId,
      );
      if (isAlreadyConnected) {
        this._logger.warn(
          `${userId} (${client.id}) is already connected, disconnecting new connection.`,
        );
        client.disconnect();
        return;
      }

      await this._roomService.addUserToRoom(userId, roomId);
      this._sidUserIds.set(client.id, userId);
      client.join(roomId);
      this.server.to(roomId).emit('room:joined', `${userId} joined the room.`);

      this._logger.log(`${userId} (${client.id}) joined the room.`);
    } catch (error) {
      this._logger.error(error);

      client.disconnect();
      return;
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;

    const roomId = Array.isArray(client.handshake.query.roomId)
      ? client.handshake.query.roomId[0]
      : client.handshake.query.roomId;

    if (token && roomId) {
      try {
        const { sub: userId } = this._jwtService.verify(token);

        await this._roomService.removeUserFromRoom(userId, roomId);
        this._sidUserIds.delete(client.id);
        client.leave(roomId);
        this.server.to(roomId).emit('room:left', `${userId} left the room.`);

        this._logger.log(`${userId} (${client.id}) left the room.`);
      } catch (error) {
        this._logger.error(error);

        client.disconnect();
        return;
      }
    }
  }

  startGame(roomId: string, game: Game) {
    this.server.to(roomId).emit('room:gameStarted', game);
  }

  makeMove(roomId: string, game: Game) {
    this.server.to(roomId).emit('game:moveMade', game);
  }
}
