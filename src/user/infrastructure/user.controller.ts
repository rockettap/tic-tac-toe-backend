import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../application/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._userService.findById(id);
  }
}
