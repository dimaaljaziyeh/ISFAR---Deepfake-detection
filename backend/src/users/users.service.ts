import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; password: string }) {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        roles: {
          create: {
            role: AppRole.USER,
          },
        },
      },
    });
    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserRoles(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
    });
    return userRoles.map((ur) => ur.role);
  }

  async hasRole(userId: string, role: AppRole): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role,
      },
    });
    return !!userRole;
  }

  async assignRole(userId: string, role: AppRole) {
    return this.prisma.userRole.create({
      data: {
        userId,
        role,
      },
    });
  }

  async removeRole(userId: string, role: AppRole) {
    return this.prisma.userRole.deleteMany({
      where: {
        userId,
        role,
      },
    });
  }
}
