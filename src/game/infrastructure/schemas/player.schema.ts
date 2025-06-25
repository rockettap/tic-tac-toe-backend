import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlayerModel = HydratedDocument<Player>;

@Schema({ _id: false })
export class Player {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  mark: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
