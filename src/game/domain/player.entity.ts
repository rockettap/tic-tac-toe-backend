import { Game } from './game.entity';
import { Mark } from './mark.value-object';
import { Position } from './position.value-object';

export class Player {
  constructor(
    private readonly _userId: string,
    public readonly mark: Mark,
  ) {}

  get id(): string {
    return this._userId;
  }

  move(game: Game, position: Position) {
    game.move(this, position);
  }

  toJSON(): object {
    return {
      userId: this.id,
      mark: this.mark,
    };
  }
}
