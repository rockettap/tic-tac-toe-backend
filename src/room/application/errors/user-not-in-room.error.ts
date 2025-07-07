export class UserNotInRoomError extends Error {
  constructor(userId: string, roomId: string) {
    super(`User '${userId}' is not a member of room '${roomId}'`);
    this.name = 'UserNotInRoomError';
  }
}
