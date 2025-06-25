export class Position {
  constructor(
    public readonly row: number,
    public readonly column: number,
  ) {
    if (!Number.isInteger(row) || row < 0 || row > 2) {
      throw new Error();
    }
    if (!Number.isInteger(column) || column < 0 || column > 2) {
      throw new Error();
    }
  }

  toIndex(): number {
    return this.row * 3 + this.column;
  }
}
