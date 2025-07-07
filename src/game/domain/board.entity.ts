import { Mark } from './mark.value-object';
import { Position } from './position.value-object';

export class Board {
  constructor(
    private _cells: (Mark | null)[] = Array(9).fill(null),
    private _history: (Mark | null)[][] = [],
    private _currentTurn: Mark = 'X',
  ) {}

  get cells(): (Mark | null)[] {
    return this._cells;
  }

  get history(): (Mark | null)[][] {
    return this._history;
  }

  get currentTurn(): Mark {
    return this._currentTurn;
  }

  get winner(): Mark | 'Draw' | null {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
      if (
        this._cells[a] &&
        this._cells[a] === this._cells[b] &&
        this._cells[a] === this._cells[c]
      ) {
        return this._cells[a];
      }
    }

    if (this._cells.every((cell) => cell)) {
      return 'Draw';
    }
    return null;
  }

  mark(position: Position) {
    const index = position.toIndex();
    if (this._cells[index] !== null) {
      throw new Error('The cell is already marked');
    }

    this._cells[index] = this._currentTurn;
    this._history.unshift([...this._cells]);

    this.switchTurn();
  }

  private switchTurn() {
    this._currentTurn = this._currentTurn === 'X' ? 'O' : 'X';
  }

  toJSON(): object {
    return {
      cells: this._cells,
      history: this._history,
      currentTurn: this._currentTurn,
    };
  }
}
