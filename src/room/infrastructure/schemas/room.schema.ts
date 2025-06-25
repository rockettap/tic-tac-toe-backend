import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Game } from 'src/game/infrastructure/schemas/game.schema';

export type RoomModel = HydratedDocument<Room>;

@Schema()
export class Room {
  @Prop({ required: true, type: Types.ObjectId })
  ownerUserId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  userIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Game', default: null })
  game: Game | null;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
