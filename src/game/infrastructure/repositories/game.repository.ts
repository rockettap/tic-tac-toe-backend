import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from 'src/game/domain/board.entity';
import { GameRepository } from '../../domain/game-repository.interface';
import { Game } from '../../domain/game.entity';
import { Mark } from '../../domain/mark.value-object';
import { Player } from '../../domain/player.entity';
import { GameModel } from '../schemas/game.schema';

@Injectable()
export class MongoGameRepository implements GameRepository {
  constructor(
    @InjectModel('Game') private readonly _gameModel: Model<GameModel>,
  ) {}

  async findById(id: string): Promise<Game | null> {
    const gameDoc = await this._gameModel.findById(id);

    return gameDoc
      ? new Game(
          gameDoc.id,
          gameDoc.players.map((player) => {
            return new Player(player.userId.toString(), player.mark as Mark);
          }),
          new Board(
            gameDoc.board.cells,
            gameDoc.board.history,
            gameDoc.board.currentTurn,
          ),
          gameDoc.status,
        )
      : null;
  }

  async findRecentByUserId(userId: string, limit: number): Promise<Game[]> {
    const gameDocs = await this._gameModel
      .find({ 'players.userId': userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const games = [];
    for (const gameDoc of gameDocs) {
      const game = new Game(
        gameDoc.id,
        gameDoc.players.map((player) => {
          return new Player(player.userId.toString(), player.mark as Mark);
        }),
        new Board(
          gameDoc.board.cells,
          gameDoc.board.history,
          gameDoc.board.currentTurn,
        ),
        gameDoc.status,
      );
      games.push(game);
    }
    return games;
  }

  async findAll(): Promise<Game[]> {
    const gameDocs = await this._gameModel.find();

    const games = [];
    for (const gameDoc of gameDocs) {
      const game = new Game(
        gameDoc.id,
        gameDoc.players.map((player) => {
          return new Player(player.userId.toString(), player.mark as Mark);
        }),
        new Board(
          gameDoc.board.cells,
          gameDoc.board.history,
          gameDoc.board.currentTurn,
        ),
        gameDoc.status,
      );
      games.push(game);
    }
    return games;
  }

  async create(game: Game): Promise<Game> {
    const createdGame = new this._gameModel({
      players: game.players.map((player) => {
        return {
          userId: player.id,
          mark: player.mark,
        };
      }),
      board: {
        cells: game.board.cells,
        history: game.board.history,
        currentTurn: game.board.currentTurn,
      },
      status: game.status,
    });
    await createdGame.save();

    return new Game(
      createdGame.id,
      createdGame.players.map((player) => {
        return new Player(player.userId.toString(), player.mark as Mark);
      }),
    );
  }

  async update(game: Game): Promise<Game | null> {
    const updatedGame = await this._gameModel.findByIdAndUpdate(
      game.id,
      {
        $set: {
          players: game.players.map((player) => {
            return {
              userId: player.id,
              mark: player.mark,
            };
          }),
          board: {
            cells: game.board.cells,
            history: game.board.history,
            currentTurn: game.board.currentTurn,
          },
          status: game.status,
        },
      },
      { new: true },
    );

    return updatedGame
      ? new Game(
          updatedGame.id,
          updatedGame.players.map((player) => {
            return new Player(player.userId.toString(), player.mark as Mark);
          }),
          new Board(
            updatedGame.board.cells,
            updatedGame.board.history,
            updatedGame.board.currentTurn,
          ),
          updatedGame.status,
        )
      : null;
  }
}
