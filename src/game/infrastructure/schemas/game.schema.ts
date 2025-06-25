import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GameStatus } from 'src/game/domain/game.entity';
import { Board, BoardSchema } from './board.schema';
import { Player, PlayerSchema } from './player.schema';

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
