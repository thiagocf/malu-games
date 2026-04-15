import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/supabase.strategy';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOrCreate(user.userId, user.email);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    const dbUser = await this.usersService.findOrCreate(user.userId, user.email);

    if (dto.name !== undefined) {
      return this.usersService.updateName(user.userId, dto.name);
    }

    return dbUser;
  }
}
