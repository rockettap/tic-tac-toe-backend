import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserService } from 'src/user/application/user.service';
import { GameService } from '../application/game.service';

@Controller('games')
export class GameController {
  constructor(
    private readonly _gameService: GameService,
    private readonly _userService: UserService,
  ) {}

  @Get(':id')
  async findGameById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return await this._gameService.findById(id.toString());
  }

  @Get()
  async findGames(@Query('userId', ParseObjectIdPipe) userId: Types.ObjectId) {
    if (userId) {
      return await this.findRecentGamesByUserId(userId.toString());
    }
    return await this.findAllGames();
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

  // @UseGuards(AuthGuard)
  // @Post(':gameId')
  // async makeMove(
  //   @Param('gameId') gameId: string,
  //   @Request() request: any,
  //   @Body() body: { row: number; column: number },
  // ) {
  //   const { row, column } = body;
  //   try {
  //     await this._gameService.makeMove(gameId, request.user.sub, row, column);
  //   } catch {
  //     throw new HttpException('Error', HttpStatus.BAD_REQUEST);
  //   }
  // }
}
