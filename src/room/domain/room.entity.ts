import { Game, GameStatus } from 'src/game/domain/game.entity';

export class Room {
  constructor(
    public readonly id: string,
    public readonly ownerUserId: string,
    private _userIds: string[] = [],
    private _game: Game | null = null,
  ) {}

  get userIds(): string[] {
    return this._userIds;
  }

  get game(): Game | null {
    return this._game;
  }

  set game(game: Game | null) {
    this._game = game;
  }

  addUser(userId: string) {
    if (this._userIds.includes(userId)) {
      return;
    }
    if (this._userIds.length >= 2) {
      throw new Error();
    }
    this._userIds.push(userId);
  }

  removeUser(userId: string) {
    const userIdIndex = this._userIds.indexOf(userId);
    if (userIdIndex === -1) {
      throw new Error();
    }

    if (this._game && !this._game.winner) {
      this._game.status = GameStatus.INTERRUPTED;
    }

    this._userIds.splice(userIdIndex, 1);
  }
}
