import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Mark } from 'src/game/domain/mark.value-object';

export type BoardModel = HydratedDocument<Board>;

@Schema({ _id: false })
export class Board {
  @Prop({ type: Array, required: true })
  cells: Mark[];

  @Prop({ type: Array, required: true })
  history: Mark[][];

  @Prop({ type: String, required: true })
  currentTurn: Mark;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
