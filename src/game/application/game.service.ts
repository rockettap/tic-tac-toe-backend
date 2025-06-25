import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/domain/user-repository.inferface';
import { GameRepository } from '../domain/game-repository.interface';
import { Game } from '../domain/game.entity';
import { Player } from '../domain/player.entity';
import { Position } from '../domain/position.value-object';

@Injectable()
export class GameService {
  constructor(
    @Inject('UserRepository') private readonly _userRepository: UserRepository,
    @Inject('GameRepository') private readonly _gameRepository: GameRepository,
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
        const user = await this._userRepository.findById(userId);
        if (!user) {
          throw new NotFoundException();
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
    const game = await this._gameRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException();
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    const player = game.players.find((player) => player.id === user.id);
    if (!player) {
      throw new ForbiddenException();
    }

    const position = new Position(row, column);

    player.move(game, position);

    return await this._gameRepository.update(game);
  }
}
