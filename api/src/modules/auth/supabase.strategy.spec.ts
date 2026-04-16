import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';

describe('SupabaseStrategy', () => {
  let strategy: SupabaseStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SupabaseStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'SUPABASE_JWT_SECRET') return 'test-secret';
              throw new Error(`Unknown key: ${key}`);
            },
          },
        },
      ],
    }).compile();

    strategy = module.get<SupabaseStrategy>(SupabaseStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should extract user id and email from JWT payload', async () => {
    const payload = {
      sub: 'uuid-123',
      email: 'parent@example.com',
    };

    const result = await strategy.validate(payload);
    expect(result).toEqual({ userId: 'uuid-123', email: 'parent@example.com' });
  });
});
