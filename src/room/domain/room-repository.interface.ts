import { Room } from './room.entity';

export interface RoomRepository {
  findById(id: string): Promise<Room | null>;
  create(room: Room): Promise<Room>;
  update(room: Room): Promise<Room | null>;
}
