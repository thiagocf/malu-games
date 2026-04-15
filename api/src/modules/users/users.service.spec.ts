import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findOrCreate', () => {
    it('should return existing user if found', async () => {
      const existingUser = {
        id: 'uuid-123',
        email: 'parent@example.com',
        name: 'Parent',
        createdAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.findOrCreate('uuid-123', 'parent@example.com');

      expect(result).toEqual(existingUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should create user if not found', async () => {
      const newUser = {
        id: 'uuid-456',
        email: 'new@example.com',
        name: null,
        createdAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreate('uuid-456', 'new@example.com');

      expect(result).toEqual(newUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { id: 'uuid-456', email: 'new@example.com' },
      });
    });
  });

  describe('updateName', () => {
    it('should update the user name', async () => {
      const updated = {
        id: 'uuid-123',
        email: 'parent@example.com',
        name: 'New Name',
        createdAt: new Date(),
      };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateName('uuid-123', 'New Name');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { name: 'New Name' },
      });
      expect(result).toEqual(updated);
    });
  });
});
