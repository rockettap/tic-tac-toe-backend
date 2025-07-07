import { GameNotFoundError } from '@/game/application/errors/game-not-found.error';
import { PlayerNotInGameError } from '@/game/application/errors/player-not-in-game.error';
import { UserNotFoundError } from '@/user/application/errors/user-not-found.error';
import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoomNotFoundError } from '../application/errors/room-not-found.error';
import { UserNotInRoomError } from '../application/errors/user-not-in-room.error';
import { RoomService } from '../application/room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly _roomService: RoomService) {}

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(@Request() request: any) {
    try {
      return await this._roomService.create(request.user.sub);
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Post(':roomId/start')
  @HttpCode(HttpStatus.CREATED)
  async startGame(
    @Param('roomId', ParseObjectIdPipe) roomId: Types.ObjectId,
    @Request() request: any,
  ) {
    try {
      return await this._roomService.startGame(
        roomId.toString(),
        request.user.sub,
      );
    } catch (err) {
      if (err instanceof RoomNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof UserNotInRoomError) {
        throw new ForbiddenException(err.message);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Post(':roomId/move')
  @HttpCode(HttpStatus.OK)
  async makeMove(
    @Param('roomId', ParseObjectIdPipe) roomId: Types.ObjectId,
    @Request() request: any,
    @Body() body: { row: number; column: number },
  ) {
    const { row, column } = body;
    try {
      await this._roomService.makeMove(
        roomId.toString(),
        request.user.sub,
        row,
        column,
      );
    } catch (err) {
      if (err instanceof GameNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof PlayerNotInGameError) {
        throw new ForbiddenException(err.message);
      }
      throw err;
    }
  }
}
