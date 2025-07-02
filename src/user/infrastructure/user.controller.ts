import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserService } from '../application/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    const user = await this._userService.findById(id.toString());
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
