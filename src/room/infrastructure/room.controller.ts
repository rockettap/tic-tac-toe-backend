import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoomService } from '../application/room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly _roomService: RoomService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createRoom(@Request() request: any) {
    try {
      return await this._roomService.create(request.user.sub);
    } catch (err) {
      // if (err instanceof InvalidEmailError) {
      //   throw new BadRequestException(err.message);
      // }
      // if (err instanceof EmailAlreadyInUseError) {
      //   throw new UnauthorizedException(err.message);
      // }
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Post(':roomId/start')
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
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Post(':roomId/move')
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
    } catch {
      throw new BadRequestException();
    }
  }
}
