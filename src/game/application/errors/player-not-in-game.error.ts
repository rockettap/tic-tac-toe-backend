export class PlayerNotInGameError extends Error {
  constructor(userId: string, gameId: string) {
    super(
      `User with ID '${userId}' is not a player in game with ID '${gameId}'`,
    );
    this.name = 'PlayerNotInGameError';
  }
}
