import { InjectQueue } from '@nestjs/bullmq';
import { forwardRef, Inject, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Queue } from 'bullmq';
import { isValidObjectId } from 'mongoose';
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
    @InjectQueue('timeout') private _timeoutQueue: Queue,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;
    if (!token) {
      return client.disconnect();
    }

    const roomId = Array.isArray(client.handshake.query.roomId)
      ? client.handshake.query.roomId[0]
      : client.handshake.query.roomId;
    if (!roomId || !isValidObjectId(roomId)) {
      return client.disconnect();
    }

    try {
      const { sub: userId } = this._jwtService.verify(token);

      const isAlreadyConnected = Array.from(this._sidUserIds.values()).includes(
        userId,
      );
      if (isAlreadyConnected) {
        this._logger.warn(
          `User ${userId} (${client.id}) is already connected, disconnecting new connection.`,
        );

        client.emit(
          'room:error',
          'Please disconnect from the other device before connecting from a new one.',
        );

        return client.disconnect();
      }

      const activeRoom = await this._roomService.findRoomByUserId(userId);
      if (activeRoom && activeRoom.id !== roomId) {
        this._logger.warn(
          `User ${userId} (${client.id}) is still assigned to room '${activeRoom.id}' but attempted to join room '${roomId}'. Rejecting connection. User must leave the current room before joining a new one.`,
        );

        client.emit(
          'room:error',
          'Disconnect from your previous room before joining a new one.',
        );

        return client.disconnect();
      }

      await this._roomService.addUserToRoom(userId, roomId);
      client.join(roomId);
      this._sidUserIds.set(client.id, userId);

      client.emit(
        'room:gameStarted',
        (await this._roomService.findRoomById(roomId)).game,
      );

      this.server.to(roomId).emit('room:joined', `${userId} joined the room.`);

      await this._timeoutQueue.remove(`job-${userId}`);
      await this._timeoutQueue.add(
        'userTimeout',
        { userId: userId },
        { delay: 135_000, jobId: `job-${userId}` },
      );

      client.conn.on('heartbeat', async () => {
        this._logger.debug(`User ${userId} (${client.id}) heartbeat.`);

        await this._timeoutQueue.remove(`job-${userId}`);
        await this._timeoutQueue.add(
          'userTimeout',
          { userId },
          { delay: 135_000, jobId: `job-${userId}` },
        );
      });

      this._logger.log(
        `User ${userId} (${client.id}) joined the room ${roomId}.`,
      );
    } catch (err) {
      this._logger.error(err);

      if (err instanceof NotFoundException) {
        client.emit(
          'room:error',
          `The room you're trying to join doesn't exist.`,
        );
      } else {
        client.emit('room:error', `Unknown error!`);
      }

      return client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;

    if (token) {
      try {
        this._sidUserIds.delete(client.id);
      } catch (err) {
        this._logger.error(err);
        return client.disconnect();
      }
    }
  }

  startGame(roomId: string, game: Game) {
    this.server.to(roomId).emit('room:gameStarted', game);
  }

  makeMove(roomId: string, game: Game) {
    this.server.to(roomId).emit('game:moveMade', game);
  }

  finishGame(roomId: string, game: Game) {
    this.server.to(roomId).emit('room:gameFinished', game.winner);
  }

  getSocketIdByUserId(userId: string): string | undefined {
    for (const [socketId, uid] of this._sidUserIds.entries()) {
      if (uid === userId) {
        return socketId;
      }
    }
    return undefined;
  }
}
