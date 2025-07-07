import { GameAlreadyStartedError } from '@/game/application/errors/game-already-started.error';
import { InjectQueue } from '@nestjs/bullmq';
import { forwardRef, Inject, Logger } from '@nestjs/common';
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
import { RoomNotFoundError } from '../application/errors/room-not-found.error';
import { UserNotInRoomError } from '../application/errors/user-not-in-room.error';
import { RoomService } from '../application/room.service';
import { Room } from '../domain/room.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway {
  @WebSocketServer() server: Server;
  public readonly _sidUserIds: Map<string, string> = new Map();
  // private readonly _userSocketIds: Map<string, string> = new Map();
  private readonly _logger = new Logger(RoomGateway.name);

  constructor(
    private readonly _jwtService: JwtService,
    @Inject(forwardRef(() => RoomService))
    private readonly _roomService: RoomService,
    @InjectQueue('timeout') private _timeoutQueue: Queue,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    // const token = Array.isArray(client.handshake.query.token)
    //   ? client.handshake.query.token[0]
    //   : client.handshake.query.token;
    // if (!token) {
    //   return client.disconnect();
    // }

    const token = client.handshake.auth.token;
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

      const existingSocketId = this.getSocketIdByUserId(userId);

      // Check if the socket still exists on the server
      const existingSocket = existingSocketId
        ? this.server.sockets.sockets.get(existingSocketId)
        : null;
      if (existingSocket && this.server.sockets.sockets.has(existingSocketId)) {
        this._logger.warn(
          `User '${userId}' ('${client.id}') is already connected, disconnecting new connection.`,
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
          `User '${userId}' ('${client.id}') is still assigned to room '${activeRoom.id}' but attempted to join room '${roomId}'. Rejecting connection. User must leave the current room before joining a new one.`,
        );

        client.emit(
          'room:error',
          'Disconnect from your previous room before joining a new one.',
        );

        return client.disconnect();
      }

      this._sidUserIds.set(client.id, userId);
      await this._roomService.addUserToRoom(userId, roomId);

      client.join(roomId);

      client.emit(
        'room:gameStarted',
        await this._roomService.findRoomById(roomId),
      );

      this.joinRoom(roomId, userId);

      await this._timeoutQueue.remove(`job-${userId}`);
      await this._timeoutQueue.add(
        'userTimeout',
        { userId: userId },
        { delay: 135_000, jobId: `job-${userId}` },
      );

      client.conn.on('heartbeat', async () => {
        this._logger.debug(`User '${userId}' ('${client.id}') heartbeat.`);

        await this._timeoutQueue.remove(`job-${userId}`);
        await this._timeoutQueue.add(
          'userTimeout',
          { userId },
          { delay: 135_000, jobId: `job-${userId}` },
        );
      });

      this._logger.debug(
        `User '${userId}' ('${client.id}') joined the room '${roomId}'.`,
      );
    } catch (err) {
      this._logger.error(err);

      if (err instanceof RoomNotFoundError) {
        client.emit('room:error', 'Room not found.');
      } else if (err instanceof UserNotInRoomError) {
        client.emit('room:error', 'You are not a member of this room.');
      } else if (err instanceof GameAlreadyStartedError) {
        client.emit(
          'room:error',
          'Cannot join room: game has already started.',
        );
      } else {
        // client.emit('room:error', 'An unexpected error occurred.');
        client.emit('room:error', err.message);
      }

      return client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      this._sidUserIds.delete(client.id);
      this._logger.debug(this._sidUserIds);
      this._logger.debug(`Client ${client.id} left the WORLD.`);
    } catch (err) {
      this._logger.error(err);
    }
  }

  startGame(roomId: string, room: Room) {
    this.server.to(roomId).emit('room:gameStarted', room);
  }

  makeMove(roomId: string, game: Game) {
    this.server.to(roomId).emit('game:moveMade', game);
  }

  finishGame(roomId: string, game: Game) {
    this.server.to(roomId).emit('room:gameFinished', game);
  }

  joinRoom(roomId: string, userId: string) {
    this.server.to(roomId).emit('room:joined', userId);
  }

  leaveRoom(roomId: string, userId: string) {
    this.server.to(roomId).emit('room:left', userId);
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
