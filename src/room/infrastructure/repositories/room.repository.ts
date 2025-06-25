import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from 'src/game/domain/board.entity';
import { Game } from 'src/game/domain/game.entity';
import { Mark } from 'src/game/domain/mark.value-object';
import { Player } from 'src/game/domain/player.entity';
import { GameModel } from 'src/game/infrastructure/schemas/game.schema';
import { RoomRepository } from 'src/room/domain/room-repository.interface';
import { Room } from 'src/room/domain/room.entity';
import { RoomModel } from '../schemas/room.schema';

@Injectable()
export class MongoRoomRepository implements RoomRepository {
  constructor(
    @InjectModel('Room') private readonly _roomModel: Model<RoomModel>,
  ) {}

  async findById(id: string): Promise<Room | null> {
    const roomDoc = await this._roomModel
      .findById(id)
      .populate<{ game: GameModel | null }>('game');
    return roomDoc
      ? new Room(
          roomDoc.id,
          roomDoc.ownerUserId.toString(),
          roomDoc.userIds.map((userId) => {
            return userId.toString();
          }),
          roomDoc.game
            ? new Game(
                roomDoc.game.id,
                roomDoc.game.players.map((player) => {
                  return new Player(
                    player.userId.toString(),
                    player.mark as Mark,
                  );
                }),
                new Board(
                  roomDoc.game.board.cells,
                  roomDoc.game.board.history,
                  roomDoc.game.board.currentTurn,
                ),
                roomDoc.game.status,
              )
            : null,
        )
      : null;
  }

  async create(room: Room): Promise<Room> {
    const createdRoom = new this._roomModel({
      ownerUserId: room.ownerUserId,
    });
    await createdRoom.save();

    return new Room(createdRoom.id, createdRoom.ownerUserId.toString());
  }

  async update(room: Room): Promise<Room | null> {
    const updatedRoom = await this._roomModel
      .findByIdAndUpdate(
        room.id,
        {
          $set: {
            ownerUserId: room.ownerUserId,
            userIds: room.userIds,
            game: room.game ? room.game.id : null,
          },
        },
        { new: true },
      )
      .populate<{ game: GameModel | null }>('game');

    return updatedRoom
      ? new Room(
          updatedRoom.id,
          updatedRoom.ownerUserId.toString(),
          updatedRoom.userIds.map((userId) => {
            return userId.toString();
          }),
          updatedRoom.game
            ? new Game(
                updatedRoom.game.id,
                updatedRoom.game.players.map((player) => {
                  return new Player(
                    player.userId.toString(),
                    player.mark as Mark,
                  );
                }),
                new Board(
                  updatedRoom.game.board.cells,
                  updatedRoom.game.board.history,
                  updatedRoom.game.board.currentTurn,
                ),
                updatedRoom.game.status,
              )
            : null,
        )
      : null;
  }
}
