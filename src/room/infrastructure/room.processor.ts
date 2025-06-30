import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RoomService } from '../application/room.service';
import { RoomGateway } from './room.gateway';

@Processor('timeout')
export class TimeoutConsumer extends WorkerHost {
  private readonly _logger = new Logger(TimeoutConsumer.name);

  constructor(
    private readonly _roomService: RoomService,
    private readonly _roomGateway: RoomGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this._logger.log(`Processing ${job.id}`);

    const room = await this._roomService.findRoomByUserId(job.data.userId);
    this._roomService.removeUserFromRoom(job.data.userId, room.id);

    // FOR TESTING PURPOSES (when closing the lid of the laptop,
    // it is buggy if you do not add this)
    const socket = this._roomGateway.server.sockets.sockets.get(
      this._roomGateway.getSocketIdByUserId(job.data.userId),
    );
    socket?.disconnect(true);

    // TODO: `room:left`

    return {};
  }
}
