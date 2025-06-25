import { Controller, Get, Param, Query } from '@nestjs/common';
import { GameService } from '../application/game.service';

@Controller('games')
export class GameController {
  constructor(private readonly _gameService: GameService) {}

  @Get(':id')
  async findGameById(@Param('id') id: string) {
    return await this._gameService.findById(id);
  }

  @Get()
  async findGames(@Query('userId') userId: string) {
    if (userId) {
      return await this.findRecentGamesByUserId(userId);
    }
    return await this.findAllGames();
  }

  private async findRecentGamesByUserId(userId: string) {
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
