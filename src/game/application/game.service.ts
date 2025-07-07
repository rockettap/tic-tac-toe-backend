import { GameNotFoundError } from '@/game/application/errors/game-not-found.error';
import { PlayerNotInGameError } from '@/game/application/errors/player-not-in-game.error';
import { GameRepository } from '@/game/domain/game-repository.interface';
import { Game } from '@/game/domain/game.entity';
import { Player } from '@/game/domain/player.entity';
import { Position } from '@/game/domain/position.value-object';
import { UserNotFoundError } from '@/user/application/errors/user-not-found.error';
import { UserService } from '@/user/application/user.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  constructor(
    @Inject('GameRepository') private readonly _gameRepository: GameRepository,
    private readonly _userService: UserService,
  ) {}

  async findById(id: string): Promise<Game | null> {
    return await this._gameRepository.findById(id);
  }

  async findRecentByUserId(
    userId: string,
    limit: number = 10,
  ): Promise<Game[]> {
    return await this._gameRepository.findRecentByUserId(userId, limit);
  }

  async findAll(): Promise<Game[]> {
    return await this._gameRepository.findAll();
  }

  async create(userIds: string[]): Promise<Game> {
    const players = await Promise.all(
      userIds.map(async (userId, index) => {
        // const user = await this._userRepository.findById(userId);
        // if (!user) {
        //   throw new NotFoundException();
        // }
        const user = await this._userService.findById(userId);
        if (!user) {
          throw new UserNotFoundError(userId);
        }

        return new Player(userId, index % 2 === 0 ? 'X' : 'O');
      }),
    );

    const game = new Game('', players);
    return await this._gameRepository.create(game);
  }

  async makeMove(
    gameId: string,
    userId: string,
    row: number,
    column: number,
  ): Promise<Game> {
    const position = new Position(row, column);

    const game = await this._gameRepository.findById(gameId);
    if (!game) {
      throw new GameNotFoundError(gameId);
    }

    // TODO: Decouple from NestJS by using custom application-layer errors'
    // instead of HTTP exceptions
    // const user = await this._userRepository.findById(userId);
    // if (!user) {
    //   throw new NotFoundException();
    // }
    const user = await this._userService.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const player = game.players.find((player) => player.id === user.id);
    if (!player) {
      throw new PlayerNotInGameError(userId, gameId);
    }

    player.move(game, position);

    return await this._gameRepository.update(game);
  }
}
