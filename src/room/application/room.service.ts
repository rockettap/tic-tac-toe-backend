import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameService } from 'src/game/application/game.service';
import { GameRepository } from 'src/game/domain/game-repository.interface';
import { UserRepository } from 'src/user/domain/user-repository.inferface';
import { RoomRepository } from '../domain/room-repository.interface';
import { Room } from '../domain/room.entity';
import { RoomGateway } from '../infrastructure/room.gateway';

@Injectable()
export class RoomService {
  constructor(
    private readonly _gameService: GameService,
    @Inject('GameRepository') private readonly _gameRepository: GameRepository,
    @Inject('UserRepository') private readonly _userRepository: UserRepository,
    @Inject('RoomRepository') private readonly _roomRepository: RoomRepository,
    @Inject(forwardRef(() => RoomGateway))
    private readonly _roomGateway: RoomGateway,
  ) {}

  async findRoomByUserId(userId: string): Promise<Room | null> {
    return this._roomRepository.findByUserId(userId);
  }

  async create(ownerUserId: string): Promise<Room> {
    const room = new Room('', ownerUserId);
    return await this._roomRepository.create(room);
  }

  async addUserToRoom(userId: string, roomId: string) {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const room = await this._roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found.`);
    }

    room.addUser(userId);

    await this._roomRepository.update(room);
  }

  async removeUserFromRoom(userId: string, roomId: string) {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const room = await this._roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found.`);
    }

    room.removeUser(userId);

    if (room.game) {
      await this._gameRepository.update(room.game);

      room.game = null;
    }

    await this._roomRepository.update(room);
  }

  async startGame(roomId: string, userId: string) {
    const room = await this._roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found.`);
    }

    // Pre-check to make sure we don't create a new game in the repository
    // without assigning it to a room.
    if (room.game) {
      throw new BadRequestException();
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    if (!room.userIds.includes(userId)) {
      throw new ForbiddenException();
    }

    const game = await this._gameService.create(room.userIds);

    room.game = game;

    const updatedRoom = await this._roomRepository.update(room);

    this._roomGateway.startGame(room.id, updatedRoom.game);
  }

  async makeMove(roomId: string, userId: string, row: number, column: number) {
    const room = await this._roomRepository.findById(roomId);

    const updatedGame = await this._gameService.makeMove(
      room.game.id,
      userId,
      row,
      column,
    );

    if (updatedGame.winner) {
      room.game = null;

      await this._roomRepository.update(room);

      // this._roomGateway.makeMove(room.id, updatedGame);
    }

    this._roomGateway.makeMove(room.id, updatedGame);
  }

  async findRoomById(roomId: string): Promise<Room | null> {
    const room = await this._roomRepository.findById(roomId);

    return room || null;
  }
}
