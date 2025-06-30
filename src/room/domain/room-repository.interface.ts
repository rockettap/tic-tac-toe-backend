import { Room } from './room.entity';

export interface RoomRepository {
  findByUserId(userId: string): Promise<Room | null>;
  findById(id: string): Promise<Room | null>;
  create(room: Room): Promise<Room>;
  update(room: Room): Promise<Room | null>;
}
