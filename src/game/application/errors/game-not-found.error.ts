export class GameNotFoundError extends Error {
  constructor(gameId: string) {
    super(`Game with ID '${gameId}' not found`);
    this.name = 'GameNotFoundError';
  }
}
