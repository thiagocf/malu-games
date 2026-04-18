# Auth + Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform malu-games from a static SPA into a platform with optional Google authentication, a NestJS API, and PostgreSQL database — without changing how games work for unauthenticated users.

**Architecture:** Monorepo with `frontend/` (existing React app, moved from root) and `api/` (new NestJS). Supabase provides Google OAuth and managed PostgreSQL. The NestJS API validates Supabase JWTs and serves as the single backend for all data operations. Login is optional — games are fully playable without authentication.

**Tech Stack:** React 18 + Vite (frontend), NestJS + TypeScript (API), Prisma (ORM), Supabase (Auth + PostgreSQL), GitHub Pages (frontend hosting), Railway or Render (API hosting)

---

### Task 1: Restructure into monorepo

Move the existing frontend code into a `frontend/` directory and set up npm workspaces.

**Files:**
- Modify: `package.json` (root — becomes workspace root)
- Move: `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js` → `frontend/`
- Modify: `frontend/package.json` (new — frontend-specific deps)
- Modify: `.github/workflows/deploy.yml` (update paths)
- Modify: `.gitignore` (add api-specific ignores)

- [ ] **Step 1: Create the frontend directory and move files**

```bash
mkdir frontend
git mv src/ frontend/src/
git mv public/ frontend/public/
git mv index.html frontend/index.html
git mv vite.config.ts frontend/vite.config.ts
git mv tsconfig.json frontend/tsconfig.json
git mv tsconfig.app.json frontend/tsconfig.app.json
git mv tsconfig.node.json frontend/tsconfig.node.json
git mv eslint.config.js frontend/eslint.config.js
```

- [ ] **Step 2: Create frontend/package.json**

Move the current `package.json` content into `frontend/package.json`, renaming to `@malu-games/frontend`:

```json
{
  "name": "@malu-games/frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.13.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "eslint": "^9.13.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "globals": "^15.11.0",
    "jsdom": "^29.0.2",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.11.0",
    "vite": "^5.4.10",
    "vitest": "^1.6.1"
  }
}
```

- [ ] **Step 3: Create root package.json with workspaces**

Replace the root `package.json` with a workspace root:

```json
{
  "name": "malu-games",
  "private": true,
  "workspaces": [
    "frontend",
    "api"
  ],
  "scripts": {
    "dev:frontend": "npm run dev -w @malu-games/frontend",
    "dev:api": "npm run start:dev -w @malu-games/api",
    "build:frontend": "npm run build -w @malu-games/frontend",
    "build:api": "npm run build -w @malu-games/api",
    "test:frontend": "npm run test -w @malu-games/frontend",
    "test:api": "npm run test -w @malu-games/api",
    "test": "npm run test:frontend && npm run test:api"
  }
}
```

- [ ] **Step 4: Update GitHub Actions deploy workflow**

Update `.github/workflows/deploy.yml` to work with the monorepo structure:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run test:frontend
      - run: npm run build:frontend

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 5: Update .gitignore**

Add API-specific entries to `.gitignore`:

```
# API
api/dist
api/node_modules

# Environment
.env
.env.*
!.env.example
```

- [ ] **Step 6: Delete old root node_modules and reinstall**

```bash
rm -rf node_modules package-lock.json
npm install
```

- [ ] **Step 7: Verify frontend still works**

```bash
npm run test:frontend
npm run build:frontend
```

Run: `npm run test:frontend`
Expected: All existing tests pass.

Run: `npm run build:frontend`
Expected: Build succeeds, output in `frontend/dist/`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: restructure into monorepo with npm workspaces"
```

---

### Task 2: Scaffold NestJS API

Create the NestJS application inside `api/` with TypeScript configuration.

**Files:**
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/tsconfig.build.json`
- Create: `api/nest-cli.json`
- Create: `api/src/main.ts`
- Create: `api/src/app.module.ts`
- Create: `api/test/jest-e2e.json`

- [ ] **Step 1: Create api/package.json**

```json
{
  "name": "@malu-games/api",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "ts-loader": "^9.5.0",
    "typescript": "~5.6.2"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create api/tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- [ ] **Step 3: Create api/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create api/nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 5: Create api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}
```

- [ ] **Step 6: Create api/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://<username>.github.io',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
```

> **Note:** Replace `<username>` with the actual GitHub username before deploying.

- [ ] **Step 7: Create api/test/jest-e2e.json**

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

- [ ] **Step 8: Install API dependencies**

```bash
cd api && npm install && cd ..
```

Or from root:
```bash
npm install
```

- [ ] **Step 9: Verify API starts**

```bash
npm run dev:api
```

Expected: NestJS logs `Nest application successfully started` on port 3000.

- [ ] **Step 10: Commit**

```bash
git add api/
git commit -m "feat(api): scaffold NestJS application"
```

---

### Task 3: Set up Prisma with User schema

Configure Prisma ORM connected to Supabase PostgreSQL with the initial `User` model.

**Files:**
- Create: `api/prisma/schema.prisma`
- Create: `api/src/prisma/prisma.module.ts`
- Create: `api/src/prisma/prisma.service.ts`
- Create: `api/src/prisma/prisma.service.spec.ts`
- Create: `api/.env.example`
- Modify: `api/package.json` (add prisma deps + scripts)
- Modify: `api/src/app.module.ts` (import PrismaModule)

- [ ] **Step 1: Add Prisma dependencies**

Add to `api/package.json`:

Dependencies:
```
"@prisma/client": "^6.0.0"
```

DevDependencies:
```
"prisma": "^6.0.0"
```

Scripts:
```
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio"
```

Run: `npm install` from root.

- [ ] **Step 2: Create api/.env.example**

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
```

- [ ] **Step 3: Create api/.env with real Supabase credentials**

Copy `.env.example` to `.env` and fill in the Supabase connection string and JWT secret from the Supabase dashboard:
- Database URL: Supabase dashboard → Settings → Database → Connection string (URI)
- JWT Secret: Supabase dashboard → Settings → API → JWT Secret

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
SUPABASE_JWT_SECRET="your-actual-jwt-secret"
```

> **Important:** Never commit `.env`. It is already in `.gitignore`.

- [ ] **Step 4: Create api/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

> Note: `id` has no `@default` — it is the Supabase Auth UUID, set explicitly on creation.

- [ ] **Step 5: Write the test for PrismaService**

Create `api/src/prisma/prisma.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
npm run test -w @malu-games/api -- --testPathPattern=prisma.service
```

Expected: FAIL — `Cannot find module './prisma.service'`

- [ ] **Step 7: Create api/src/prisma/prisma.service.ts**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 8: Create api/src/prisma/prisma.module.ts**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 9: Generate Prisma client and run test**

```bash
cd api && npx prisma generate && cd ..
npm run test -w @malu-games/api -- --testPathPattern=prisma.service
```

Expected: PASS

- [ ] **Step 10: Import PrismaModule in AppModule**

Update `api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
```

- [ ] **Step 11: Run initial migration against Supabase**

```bash
cd api && npx prisma migrate dev --name init
```

Expected: Migration creates `users` table in Supabase PostgreSQL.

- [ ] **Step 12: Commit**

```bash
git add api/prisma/ api/src/prisma/ api/src/app.module.ts api/package.json api/.env.example
git commit -m "feat(api): set up Prisma with User schema"
```

---

### Task 4: Auth module — JWT validation

Create the `auth` module that validates Supabase JWTs and provides the `@CurrentUser()` decorator.

**Files:**
- Create: `api/src/modules/auth/auth.module.ts`
- Create: `api/src/modules/auth/supabase.strategy.ts`
- Create: `api/src/modules/auth/auth.guard.ts`
- Create: `api/src/modules/auth/current-user.decorator.ts`
- Create: `api/src/modules/auth/auth.guard.spec.ts`
- Modify: `api/package.json` (add passport + jwt deps)
- Modify: `api/src/app.module.ts` (import AuthModule)

- [ ] **Step 1: Add Passport and JWT dependencies**

Add to `api/package.json` dependencies:
```
"@nestjs/config": "^4.0.0",
"@nestjs/passport": "^11.0.0",
"passport": "^0.7.0",
"passport-jwt": "^4.0.1"
```

Add to `api/package.json` devDependencies:
```
"@types/passport-jwt": "^4.0.1"
```

Run: `npm install` from root.

- [ ] **Step 2: Write the test for SupabaseStrategy**

Create `api/src/modules/auth/supabase.strategy.spec.ts`:

```typescript
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
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm run test -w @malu-games/api -- --testPathPattern=supabase.strategy
```

Expected: FAIL — `Cannot find module './supabase.strategy'`

- [ ] **Step 4: Create api/src/modules/auth/supabase.strategy.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthenticatedUser = {
  userId: string;
  email: string;
};

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { userId: payload.sub, email: payload.email };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test -w @malu-games/api -- --testPathPattern=supabase.strategy
```

Expected: PASS

- [ ] **Step 6: Create api/src/modules/auth/auth.guard.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {}
```

- [ ] **Step 7: Create api/src/modules/auth/current-user.decorator.ts**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './supabase.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);
```

- [ ] **Step 8: Create api/src/modules/auth/auth.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
  providers: [SupabaseStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
```

- [ ] **Step 9: Import AuthModule and ConfigModule in AppModule**

Update `api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 10: Run all API tests**

```bash
npm run test -w @malu-games/api
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add api/
git commit -m "feat(api): add auth module with Supabase JWT validation"
```

---

### Task 5: Users module — GET/POST /users/me

Create the `users` module with the "get or create current user" endpoint.

**Files:**
- Create: `api/src/modules/users/users.module.ts`
- Create: `api/src/modules/users/users.controller.ts`
- Create: `api/src/modules/users/users.service.ts`
- Create: `api/src/modules/users/users.service.spec.ts`
- Create: `api/src/modules/users/users.dto.ts`
- Modify: `api/src/app.module.ts` (import UsersModule)

- [ ] **Step 1: Write the test for UsersService**

Create `api/src/modules/users/users.service.spec.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -w @malu-games/api -- --testPathPattern=users.service
```

Expected: FAIL — `Cannot find module './users.service'`

- [ ] **Step 3: Create api/src/modules/users/users.dto.ts**

```typescript
export class UpdateUserDto {
  name?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}
```

- [ ] **Step 4: Create api/src/modules/users/users.service.ts**

```typescript
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
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test -w @malu-games/api -- --testPathPattern=users.service
```

Expected: PASS

- [ ] **Step 6: Create api/src/modules/users/users.controller.ts**

```typescript
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
    await this.usersService.findOrCreate(user.userId, user.email);

    if (dto.name !== undefined) {
      return this.usersService.updateName(user.userId, dto.name);
    }

    return this.usersService.findOrCreate(user.userId, user.email);
  }
}
```

- [ ] **Step 7: Create api/src/modules/users/users.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 8: Import UsersModule in AppModule**

Update `api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 9: Run all API tests**

```bash
npm run test -w @malu-games/api
```

Expected: All tests pass.

- [ ] **Step 10: Commit**

```bash
git add api/
git commit -m "feat(api): add users module with GET/PATCH /users/me"
```

---

### Task 6: Health check endpoint (unauthenticated)

Add a simple health check at `GET /health` so Railway/Render can monitor uptime and you can verify the API is reachable without auth.

**Files:**
- Create: `api/src/health/health.controller.ts`
- Create: `api/src/health/health.module.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Create api/src/health/health.controller.ts**

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

- [ ] **Step 2: Create api/src/health/health.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 3: Import HealthModule in AppModule**

Update `api/src/app.module.ts` — add `HealthModule` to imports:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Verify manually**

```bash
npm run dev:api
# In another terminal:
curl http://localhost:3000/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 5: Commit**

```bash
git add api/
git commit -m "feat(api): add health check endpoint"
```

---

### Task 7: Frontend — Add Supabase Auth (optional login)

Add Google login to the frontend as an optional feature — games remain accessible without authentication.

**Files:**
- Modify: `frontend/package.json` (add @supabase/supabase-js)
- Create: `frontend/src/auth/supabase.ts`
- Create: `frontend/src/auth/AuthContext.tsx`
- Create: `frontend/src/auth/LoginButton.tsx`
- Create: `frontend/src/auth/LoginButton.module.css`
- Modify: `frontend/src/main.tsx` (wrap with AuthProvider)
- Modify: `frontend/src/App.tsx` (add LoginButton)
- Create: `frontend/.env.example`

- [ ] **Step 1: Add Supabase dependency**

Add to `frontend/package.json` dependencies:
```
"@supabase/supabase-js": "^2.45.0"
```

Run: `npm install` from root.

- [ ] **Step 2: Create frontend/.env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Create frontend/.env with real Supabase values**

Get both from Supabase dashboard → Settings → API:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-actual-anon-key
```

> These are public by design. Still excluded from git via `.gitignore`.

- [ ] **Step 4: Create frontend/src/auth/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 5: Create frontend/src/auth/AuthContext.tsx**

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 6: Create frontend/src/auth/LoginButton.module.css**

```css
.loginArea {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
}

.loginButton {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  color: #7c3aed;
  font-family: 'Nunito', 'Fredoka One', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.loginButton:hover {
  background: rgba(255, 255, 255, 0.45);
}

.userInfo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  font-family: 'Nunito', 'Fredoka One', sans-serif;
  font-size: 0.85rem;
  color: #7c3aed;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.signOutButton {
  border: none;
  background: none;
  color: #a855f7;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
}

.signOutButton:hover {
  background: rgba(168, 85, 247, 0.15);
}
```

- [ ] **Step 7: Create frontend/src/auth/LoginButton.tsx**

```tsx
import { useAuth } from './AuthContext';
import styles from './LoginButton.module.css';

export function LoginButton() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <div className={styles.userInfo}>
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className={styles.avatar}
          />
        )}
        <span>{user.user_metadata?.full_name ?? user.email}</span>
        <button onClick={signOut} className={styles.signOutButton}>
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className={styles.loginArea}>
      <button onClick={signInWithGoogle} className={styles.loginButton}>
        Entrar com Google
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Wrap App with AuthProvider in main.tsx**

Update `frontend/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

- [ ] **Step 9: Add LoginButton to App.tsx**

Import and render `LoginButton` at the top of the `App` component. Add it before the existing conditional returns so it appears on all screens:

At the top of `App.tsx`, add the import:
```typescript
import { LoginButton } from './auth/LoginButton';
```

Inside the `App` function, add `<LoginButton />` before the first conditional:

```tsx
export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('solo')
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES)

  return (
    <>
      <LoginButton />
      {showSettings ? (
        <Settings
          pairCount={pairCount}
          onChangePairCount={setPairCount}
          playerMode={playerMode}
          playerNames={playerNames}
          onChangePlayerMode={setPlayerMode}
          onChangePlayerNames={setPlayerNames}
          onBack={() => setShowSettings(false)}
        />
      ) : !selectedDeck ? (
        <DeckSelector
          decks={DECKS}
          onSelect={setSelectedDeck}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <Game
          deck={selectedDeck}
          pairCount={pairCount}
          players={playerMode === 'duo' ? playerNames : [playerNames[0]]}
          onBackToMenu={() => setSelectedDeck(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 10: Verify frontend builds**

```bash
npm run build:frontend
```

Expected: Build succeeds (env vars not needed at build time for dev; the error check in `supabase.ts` runs at runtime).

> **Note:** For the build in CI to work, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions secrets and pass them as env vars in the deploy workflow.

- [ ] **Step 11: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): add optional Google login via Supabase"
```

---

### Task 8: Frontend — API client for authenticated requests

Create a thin HTTP client that attaches the Supabase JWT to requests to the NestJS API.

**Files:**
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: Create frontend/src/api/client.ts**

```typescript
import { supabase } from '../auth/supabase';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return {};

  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: Add VITE_API_URL to frontend/.env.example**

Append to `frontend/.env.example`:
```
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 3: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): add API client with JWT auth headers"
```

---

### Task 9: Update GitHub Actions for monorepo env vars

Update the deploy workflow to pass Supabase env vars for the frontend build.

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update deploy.yml with env vars**

Update the build step in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run test:frontend
      - run: npm run build:frontend
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

> **Manual step required:** Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` as repository secrets in GitHub → Settings → Secrets and variables → Actions.

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "ci: pass Supabase env vars in frontend build"
```

---

### Task 10: Supabase project setup (manual)

Configure the Supabase project for Google OAuth. This is a manual task — no code changes.

- [ ] **Step 1: Create Supabase project**

Go to [supabase.com](https://supabase.com), create a new project. Note:
- Project URL → `VITE_SUPABASE_URL`
- Anon key → `VITE_SUPABASE_ANON_KEY`
- JWT Secret → `SUPABASE_JWT_SECRET` (API env)
- Database connection string → `DATABASE_URL` (API env)

- [ ] **Step 2: Enable Google Auth provider**

Supabase dashboard → Authentication → Providers → Google:
1. Enable Google provider
2. Create OAuth credentials in Google Cloud Console (APIs & Services → Credentials → OAuth 2.0 Client ID)
3. Set the authorized redirect URI to: `https://<your-project>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret into Supabase Google provider settings

- [ ] **Step 3: Configure redirect URLs**

Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://<username>.github.io/malu-games/`
- Redirect URLs: add both:
  - `https://<username>.github.io/malu-games/`
  - `http://localhost:5173/malu-games/`

---

### Task 11: End-to-end verification

Verify the full flow works: frontend loads, optional login, API responds.

- [ ] **Step 1: Start API locally**

```bash
npm run dev:api
```

Verify: `curl http://localhost:3000/health` returns `{"status":"ok"}`

- [ ] **Step 2: Start frontend locally**

```bash
npm run dev:frontend
```

Verify: App opens in browser, games work without login, "Entrar com Google" button is visible.

- [ ] **Step 3: Test Google login flow**

1. Click "Entrar com Google"
2. Complete Google OAuth flow
3. Verify: button changes to show user name and avatar
4. Verify: clicking "Sair" returns to unauthenticated state

- [ ] **Step 4: Test API with authenticated request**

After logging in, open browser dev tools console:

```javascript
// Get the current session token
const { data: { session } } = await supabase.auth.getSession();
// Call API
const res = await fetch('http://localhost:3000/users/me', {
  headers: { 'Authorization': `Bearer ${session.access_token}` }
});
const user = await res.json();
console.log(user);
```

Expected: Returns the user object with `id`, `email`, `name`, `createdAt`.

- [ ] **Step 5: Verify unauthenticated API access is denied**

```bash
curl http://localhost:3000/users/me
```

Expected: `401 Unauthorized`

- [ ] **Step 6: Final commit if any cleanup needed**

```bash
git status
# If any uncommitted changes from verification:
git add -A
git commit -m "chore: verification cleanup"
```

---

## Update CLAUDE.md

After all tasks are complete, update `CLAUDE.md` to reflect the new monorepo structure, API commands, and architecture. This is not a separate task — it should be done as part of the final verification.
