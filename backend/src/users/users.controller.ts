import { Controller, Get, UseGuards, Request, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Post(':userId/roles/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to user (admin only)' })
  async assignRole(@Param('userId') userId: string, @Param('role') role: string) {
    return this.usersService.assignRole(userId, role as any);
  }

  @Post(':userId/roles/:role/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove role from user (admin only)' })
  async removeRole(@Param('userId') userId: string, @Param('role') role: string) {
    return this.usersService.removeRole(userId, role as any);
  }
}
