export class GameAlreadyStartedError extends Error {
  constructor(gameId: string) {
    super(
      `Cannot perform this action: the game with ID '${gameId}' has already started`,
    );
    this.name = 'GameAlreadyStartedError';
  }
}
