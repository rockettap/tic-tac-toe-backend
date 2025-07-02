import { GameStatus } from '@/game/domain/game.entity';
import { Board, BoardSchema } from '@/game/infrastructure/schemas/board.schema';
import {
  Player,
  PlayerSchema,
} from '@/game/infrastructure/schemas/player.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameModel = HydratedDocument<Game>;

@Schema({ timestamps: true })
export class Game {
  @Prop({ type: [PlayerSchema], required: true })
  players: Player[];

  @Prop({ type: BoardSchema, required: true })
  board: Board;

  @Prop({ type: String, enum: GameStatus, default: GameStatus.IN_PROGRESS })
  status: GameStatus;
}

export const GameSchema = SchemaFactory.createForClass(Game);
