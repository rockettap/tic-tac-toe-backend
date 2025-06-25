import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
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
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AuthGuard)
  @Post(':roomId/start')
  async startGame(@Param('roomId') roomId: string, @Request() request: any) {
    return await this._roomService.startGame(roomId, request.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(':roomId/move')
  async makeMove(
    @Param('roomId') roomId: string,
    @Request() request: any,
    @Body() body: { row: number; column: number },
  ) {
    const { row, column } = body;
    try {
      await this._roomService.makeMove(roomId, request.user.sub, row, column);
    } catch {
      throw new BadRequestException();
    }
  }
}
