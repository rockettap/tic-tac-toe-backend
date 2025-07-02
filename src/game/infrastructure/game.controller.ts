import { GameService } from '@/game/application/game.service';
import { UserService } from '@/user/application/user.service';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Controller('games')
export class GameController {
  constructor(
    private readonly _gameService: GameService,
    private readonly _userService: UserService,
  ) {}

  @Get(':id')
  async findGameById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    const game = await this._gameService.findById(id.toString());
    if (!game) {
      throw new NotFoundException();
    }
    return game;
  }

  @Get()
  async findGames(@Query('userId', ParseObjectIdPipe) userId: Types.ObjectId) {
    if (userId) {
      return await this.findRecentGamesByUserId(userId.toString());
    }
    // return await this.findAllGames();
  }

  private async findRecentGamesByUserId(userId: string) {
    const user = await this._userService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    return await this._gameService.findRecentByUserId(userId);
  }

  private async findAllGames() {
    return await this._gameService.findAll();
  }
}
