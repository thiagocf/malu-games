import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(id: string, email: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (existing) return existing;

    return this.prisma.user.create({
      data: { id, email },
    });
  }

  async updateName(id: string, name: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { name },
    });
  }
}
