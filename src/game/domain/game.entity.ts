import { Board } from './board.entity';
import { Player } from './player.entity';
import { Position } from './position.value-object';

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  INTERRUPTED = 'INTERRUPTED',
}

export class Game {
  constructor(
    public readonly id: string,
    private _players: Player[],
    private _board: Board = new Board(),
    private _status: GameStatus = GameStatus.IN_PROGRESS,
  ) {
    if (_players.length !== 2) throw new Error();
    if (_players[0].mark === _players[1].mark) throw new Error();
  }

  get players(): Player[] {
    return this._players;
  }

  get board(): Board {
    return this._board;
  }

  get winner(): Player | 'Draw' | null {
    const boardWinner = this._board.winner;
    if (boardWinner === 'Draw') {
      return 'Draw';
    }
    return this._players.find((player) => player.mark === boardWinner) || null;
  }

  get status(): GameStatus {
    return this._status;
  }

  set status(gameStatus: GameStatus) {
    this._status = gameStatus;
  }

  move(player: Player, position: Position) {
    if (this._status !== GameStatus.IN_PROGRESS) {
      throw new Error();
    }

    if (this._board.currentTurn !== player.mark) {
      throw new Error();
    }

    this._board.mark(position);

    if (this.winner) {
      this._status = GameStatus.FINISHED;
    }
  }

  toJSON(): object {
    return {
      id: this.id,
      players: this.players,
      board: this.board,
      winner: this.winner,
      status: this._status,
    };
  }
}
