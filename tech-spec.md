# Tech Spec: AI Front Desk for Early Education Centers

*Based on [product-spec.md](product-spec.md) — Last updated: April 22, 2026*

---

## 1. Overview

This document describes the technical architecture for the AI Front Desk feature. The system consists of a NestJS REST API backend, a React/TypeScript frontend, and a PostgreSQL database with the pgvector extension for semantic search. Both applications live in a single pnpm monorepo and deploy to Render.

---

## 2. Monorepo Structure

```
brightwheel/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── schools/
│   │   │   ├── users/
│   │   │   ├── knowledge/
│   │   │   ├── handbooks/
│   │   │   ├── conversations/
│   │   │   ├── chat/           # WebSocket gateway
│   │   │   ├── ai/             # AI service (embeddings + generation)
│   │   │   ├── storage/        # Render object storage client
│   │   │   ├── notifications/  # Operator WebSocket gateway
│   │   │   ├── config/
│   │   │   ├── database/
│   │   │   └── main.ts
│   │   ├── test/
│   │   │   ├── helpers/        # DB seeding, test factories
│   │   │   └── *.e2e-spec.ts
│   │   ├── jest.config.ts
│   │   ├── jest-e2e.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── app/            # Root layout, providers
│       │   ├── features/
│       │   │   ├── chat/       # Parent-facing chat page
│       │   │   ├── onboarding/ # Admin KB setup wizard
│       │   │   ├── inbox/      # Operator conversation inbox
│       │   │   └── knowledge/  # KB editor
│       │   ├── components/     # Shared UI components
│       │   ├── hooks/
│       │   ├── lib/            # API client, WS client, query config
│       │   ├── store/          # Zustand stores
│       │   ├── theme/          # Chakra UI v3 theme
│       │   └── main.tsx
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/                 # Shared TypeScript types
│       ├── src/
│       │   ├── dto/
│       │   └── enums/
│       └── package.json
├── .github/
│   └── workflows/
│       ├── api-ci.yml
│       └── web-ci.yml
├── render.yaml
├── pnpm-workspace.yaml
└── package.json
```

### Root `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 3. Backend

### 3.1 Stack

| Concern | Choice |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | TypeORM |
| Database | PostgreSQL 16 + pgvector extension |
| Auth | JWT (access + refresh token pattern) |
| Real-time | `@nestjs/websockets` with `socket.io` |
| File storage | Render Object Storage (S3-compatible via `@aws-sdk/client-s3`) |
| AI — embeddings | OpenAI `text-embedding-3-small` (1536 dimensions) |
| AI — generation | Anthropic `claude-sonnet-4-6` |
| Testing | Jest + Supertest, real test DB |

### 3.2 NestJS Module Map

```
AppModule
├── ConfigModule          (global, loads .env)
├── DatabaseModule        (TypeORM, global)
├── AuthModule            (JWT strategy, guards, refresh tokens)
├── SchoolsModule         (school settings, slug lookup)
├── UsersModule           (admin + staff accounts)
├── KnowledgeModule       (Q&A CRUD + embedding upsert)
├── HandbooksModule       (upload, AI extraction, diff, version history)
├── ConversationsModule   (conversation + message persistence)
├── ChatModule            (WebSocket gateway — parent chat)
├── NotificationsModule   (WebSocket gateway — operator notifications)
├── AIModule              (embedding + generation services)
└── StorageModule         (Render object storage client)
```

### 3.3 Database Schema

All entities use TypeORM decorators. UUID primary keys throughout.

#### `schools`

```typescript
@Entity()
export class School {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) slug: string;
  @Column() name: string;
  @Column({ nullable: true }) logoUrl: string;
  @Column({ type: 'float', default: 0.8 }) escalationThreshold: number;
  @Column({ default: false }) isActive: boolean;  // true once KB complete
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => User, u => u.school) users: User[];
  @OneToMany(() => KnowledgeEntry, k => k.school) knowledgeEntries: KnowledgeEntry[];
  @OneToMany(() => Handbook, h => h.school) handbooks: Handbook[];
  @OneToMany(() => Conversation, c => c.school) conversations: Conversation[];
}
```

#### `users`

```typescript
export enum UserRole { ADMIN = 'admin', STAFF = 'staff' }

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @Column({ type: 'enum', enum: UserRole }) role: UserRole;
  @ManyToOne(() => School, s => s.users) school: School;
  @Column() schoolId: string;
  @CreateDateColumn() createdAt: Date;
}
```

#### `knowledge_entries`

```typescript
export enum KnowledgeSource { HANDBOOK = 'handbook', MANUAL = 'manual', AI_GENERATED = 'ai_generated' }
export enum KnowledgeConfidence { HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }

@Entity()
export class KnowledgeEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() question: string;
  @Column({ type: 'text' }) answer: string;
  @Column({ type: 'enum', enum: KnowledgeSource }) source: KnowledgeSource;
  @Column({ nullable: true }) sourceExcerpt: string;
  @Column({ type: 'enum', enum: KnowledgeConfidence, nullable: true }) confidence: KnowledgeConfidence;
  // pgvector column — 1536 dims for text-embedding-3-small
  @Column({ type: 'vector', length: 1536, nullable: true }) embedding: number[];
  @Column({ default: true }) isActive: boolean;
  @ManyToOne(() => School, s => s.knowledgeEntries) school: School;
  @Column() schoolId: string;
  @ManyToOne(() => Handbook, { nullable: true }) handbook: Handbook;
  @Column({ nullable: true }) handbookId: string;
  @UpdateDateColumn() updatedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
```

#### `handbooks`

```typescript
@Entity()
export class Handbook {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() filename: string;
  @Column() storageKey: string;   // object storage path
  @Column({ default: false }) isCurrent: boolean;
  @ManyToOne(() => School, s => s.handbooks) school: School;
  @Column() schoolId: string;
  @CreateDateColumn() createdAt: Date;
}
```

#### `conversations`

```typescript
export enum ConversationStatus {
  NEEDS_ATTENTION = 'needs_attention',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) parentName: string;
  @Column({ nullable: true }) parentEmail: string;
  @Column({ type: 'enum', enum: ConversationStatus, default: ConversationStatus.IN_PROGRESS })
  status: ConversationStatus;
  @Column({ type: 'float', nullable: true }) lastCertaintyScore: number;
  @ManyToOne(() => School, s => s.conversations) school: School;
  @Column() schoolId: string;
  @ManyToOne(() => User, { nullable: true }) assignedTo: User;
  @Column({ nullable: true }) assignedToId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => Message, m => m.conversation) messages: Message[];
}
```

#### `messages`

```typescript
export enum MessageSender { PARENT = 'parent', AI = 'ai', STAFF = 'staff' }

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'text' }) content: string;
  @Column({ type: 'enum', enum: MessageSender }) sender: MessageSender;
  @Column({ type: 'float', nullable: true }) certaintyScore: number;
  @Column({ default: false }) wasEscalated: boolean;
  @ManyToOne(() => Conversation, c => c.messages) conversation: Conversation;
  @Column() conversationId: string;
  @ManyToOne(() => User, { nullable: true }) staffSender: User;
  @Column({ nullable: true }) staffSenderId: string;
  @CreateDateColumn() createdAt: Date;
}
```

#### `refresh_tokens`

```typescript
@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() token: string;
  @ManyToOne(() => User) user: User;
  @Column() userId: string;
  @Column() expiresAt: Date;
  @Column({ default: false }) revoked: boolean;
  @CreateDateColumn() createdAt: Date;
}
```

### 3.4 Authentication

Two token classes share the same JWT infrastructure:

| Token class | Subject | Expiry | Issued by |
|---|---|---|---|
| Operator access token | `userId` | 15 minutes | `POST /auth/login` |
| Operator refresh token | `userId` | 30 days | `POST /auth/login` |
| Parent session token | `conversationId` | 24 hours | `POST /chat/:slug/session` |

**Operator login flow:**

1. `POST /auth/login` validates credentials, issues `accessToken` + `refreshToken`.
2. Access token is sent in `Authorization: Bearer <token>` on each request.
3. `POST /auth/refresh` accepts a valid refresh token and returns a new access token.
4. `POST /auth/logout` revokes the refresh token row.

**Parent chat flow:**

1. `POST /chat/:slug/session` creates a `Conversation` row and returns a short-lived JWT containing `conversationId` and `schoolId`.
2. This token authenticates the parent's WebSocket connection and any REST calls to the chat namespace.
3. No user account is created; the parent is anonymous unless they volunteer name/email.

**Guards:**

- `JwtAuthGuard` — validates operator access tokens (applied globally, overridden with `@Public()` decorator for public routes).
- `ParentSessionGuard` — validates parent session tokens (applied to chat WebSocket gateway and `GET /chat/:slug`).
- `RolesGuard` — checks `UserRole` where needed (e.g., admin-only KB edits).

### 3.5 REST API Endpoints

All operator endpoints require a valid operator JWT. All responses follow `{ data, meta? }` envelope. Errors follow `{ statusCode, message, error }`.

#### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Email + password → access + refresh tokens |
| POST | `/auth/refresh` | Public | Refresh token → new access token |
| POST | `/auth/logout` | Operator | Revoke refresh token |
| GET | `/auth/me` | Operator | Current user info |

#### Schools

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/schools/:id` | Operator | School details |
| PATCH | `/schools/:id` | Admin | Update name, logo, escalation threshold |
| GET | `/schools/:id/onboarding-status` | Admin | Which base inquiries still need answers |

#### Knowledge Base

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/schools/:id/knowledge` | Operator | List entries (supports `?source=`, `?q=`) |
| POST | `/schools/:id/knowledge` | Admin | Create entry (triggers embedding generation) |
| PATCH | `/schools/:id/knowledge/:entryId` | Admin | Update entry (re-embeds on answer change) |
| DELETE | `/schools/:id/knowledge/:entryId` | Admin | Soft-delete entry |

#### Handbooks

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/schools/:id/handbooks` | Admin | List handbook versions |
| POST | `/schools/:id/handbooks` | Admin | Upload new handbook (multipart/form-data) |
| POST | `/schools/:id/handbooks/:handbookId/extract` | Admin | Trigger AI extraction job |
| GET | `/schools/:id/handbooks/:handbookId/diff` | Admin | Get proposed KB changes vs. current |
| POST | `/schools/:id/handbooks/:handbookId/confirm` | Admin | Accept/reject diff items and apply |
| POST | `/schools/:id/handbooks/:handbookId/restore` | Admin | Restore a historical version as current |

#### Conversations

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/schools/:id/conversations` | Operator | List conversations (supports `?status=`) |
| GET | `/schools/:id/conversations/:conversationId` | Operator | Full conversation with messages |
| PATCH | `/schools/:id/conversations/:conversationId` | Operator | Assign staff member, update status |
| POST | `/schools/:id/conversations/:conversationId/resolve` | Operator | Mark resolved |
| POST | `/schools/:id/conversations/:conversationId/knowledge-suggestion` | Operator | Accept escalation Q&A into KB |

#### Parent Chat (Public REST)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/chat/:slug` | Public | School display info for chat page |
| POST | `/chat/:slug/session` | Public | Create conversation + issue parent JWT |
| PATCH | `/chat/:slug/session/identity` | Parent session | Update parent name/email |

### 3.6 WebSocket Events

Two `socket.io` namespaces. Both require a JWT in the connection handshake `auth` field.

#### `/chat` — Parent ↔ AI

| Event | Direction | Payload |
|---|---|---|
| `message:send` | Client → Server | `{ content: string }` |
| `message:token` | Server → Client | `{ token: string, messageId: string }` — streamed chunks |
| `message:complete` | Server → Client | `{ messageId: string, certaintyScore: number, wasEscalated: boolean }` |
| `message:error` | Server → Client | `{ error: string }` |
| `staff:reply` | Server → Client | `{ message: Message }` — when staff sends a reply |

#### `/notifications` — Operator inbox

| Event | Direction | Payload |
|---|---|---|
| `conversation:escalated` | Server → Client | `{ conversation: ConversationSummary }` |
| `conversation:updated` | Server → Client | `{ conversationId: string, status: ConversationStatus }` |
| `conversation:staff_reply` | Server → Client | `{ conversationId: string, message: Message }` |

On connect to `/notifications`, the server joins the socket to a `school:{schoolId}` room so broadcasts are scoped per school.

### 3.7 AI Pipeline

#### Embedding Generation

`AIService.embed(text: string): Promise<number[]>`

- Calls `text-embedding-3-small` via the OpenAI SDK.
- Triggered on: knowledge entry create, knowledge entry answer update.
- Stored in `knowledge_entries.embedding` (pgvector `vector(1536)` column).

#### Semantic Search

`AIService.searchKnowledge(schoolId: string, query: string, k = 5): Promise<KnowledgeEntry[]>`

- Embeds the parent query.
- Runs pgvector cosine similarity query:
  ```sql
  SELECT *, 1 - (embedding <=> $1) AS similarity
  FROM knowledge_entries
  WHERE school_id = $2 AND is_active = true
  ORDER BY embedding <=> $1
  LIMIT $3;
  ```
- Returns top-k entries with similarity scores.

#### Response Generation + Certainty Scoring

`AIService.generateResponse(query, retrievedEntries): Promise<{ content: string, certaintyScore: number }>`

1. Constructs a system prompt containing retrieved Q&A pairs as grounding context.
2. Calls `claude-sonnet-4-6` with streaming enabled; tokens are forwarded to the parent WebSocket connection in real time.
3. **Certainty score** is a composite of:
   - `cosineSimilarity` — similarity of top retrieved entry (0–1).
   - `coverageScore` — fraction of top-k entries with similarity > 0.7, normalized to 0–1.
   - Final score: `0.7 * cosineSimilarity + 0.3 * coverageScore`.
4. If `certaintyScore < school.escalationThreshold`, the conversation is flagged and a `conversation:escalated` event is emitted to the school's operator room.

#### Handbook Extraction

`HandbookExtractionService.extract(handbookId): Promise<ExtractedQA[]>`

1. Downloads the handbook PDF/DOCX from object storage.
2. Converts to plain text (using `pdf-parse` for PDF, `mammoth` for DOCX).
3. Calls `claude-sonnet-4-6` with a structured output prompt to extract:
   - Answers to each of the 12 required base inquiries.
   - Any additional distinct topic Q&A pairs.
   - Source excerpt and confidence (high/medium/low) for each.
4. Returns structured `ExtractedQA[]` — stored as a pending diff, not directly in `knowledge_entries`.

### 3.8 File Storage

`StorageService` wraps the AWS SDK v3 `S3Client` pointed at Render Object Storage.

```typescript
interface StorageService {
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>; // returns public URL
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
```

Handbook storage key format: `handbooks/{schoolId}/{handbookId}/{filename}`.

Max file size enforced at the NestJS `FileInterceptor` layer (50 MB).

---

## 4. Frontend

### 4.1 Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Component library | Chakra UI v3 |
| Server state | TanStack Query (React Query) v5 |
| Client state | Zustand |
| Routing | React Router v6 |
| WebSocket | `socket.io-client` |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (configured instance with interceptor for auth headers + token refresh) |

### 4.2 Routes

```
/                          → redirect to /login
/login                     → operator login
/app/                      → authenticated operator shell
  /app/onboarding          → KB setup wizard
  /app/inbox               → conversation inbox
  /app/inbox/:id           → single conversation thread
  /app/knowledge           → KB editor
  /app/settings            → school settings (escalation threshold, etc.)
  /app/handbooks           → handbook management
/chat/:slug                → parent-facing chat page (public)
```

### 4.3 Feature Modules

#### `features/chat`

- `ChatPage` — full-page layout for parent, renders chat UI.
- `ChatWindow` — responsive container (full-screen mobile, side panel tablet, fixed panel desktop).
- `MessageList` — renders message bubbles; auto-scrolls.
- `MessageInput` — text input + send button.
- `TypingIndicator` — animated dots while AI is streaming.
- `useParentChat` hook — manages socket connection, message list state, session JWT in `localStorage`.

Session persistence: conversation ID and JWT stored in `localStorage` keyed by `chat:{slug}`. On page reload, the hook attempts to reconnect using the stored token. If the token is expired, a new session is created.

#### `features/inbox`

- `InboxPage` — filterable list of conversations.
- `ConversationCard` — shows parent name, preview, certainty badge, time elapsed.
- `ConversationThread` — full chat history + staff reply box.
- `EscalationNotification` — toast-style popup for real-time escalation events.
- `useOperatorSocket` hook — connects to `/notifications` namespace, subscribes to school-scoped events, updates Zustand store.

#### `features/onboarding`

- `OnboardingWizard` — step-by-step form for base inquiries.
- `HandbookUploader` — file drop zone.
- `ExtractionProgress` — polling progress indicator during AI extraction.
- `DiffReviewer` — three-column table (new/changed/removed) with accept/reject per row and bulk actions.

#### `features/knowledge`

- `KnowledgeEditor` — searchable, filterable table of Q&A pairs.
- `EntryForm` — inline edit form.

### 4.4 Chakra UI v3 Theme

Located at `src/theme/index.ts`. Extends Chakra's base theme with Brightwheel design tokens.

```typescript
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        blurple: { value: '#5463D6' },
        caribbean: { value: '#29B9BB' },
        charcoal: { value: '#18181D' },
        graphite: { value: '#5C5E6A' },
        minersCoal: { value: '#737685' },
        cloud: { value: '#EBEFF4' },
        air: { value: '#F7F9FB' },
        joker: { value: '#3BBA6E' },
        lemon: { value: '#FECC38' },
        strawberry: { value: '#CF193A' },
        blackout: { value: '#1E2549' },
      },
      fonts: {
        heading: { value: '"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif' },
        body: { value: '"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif' },
      },
      fontSizes: {
        h1: { value: '70px' },
        h2: { value: '36px' },
        h3: { value: '22px' },
        body: { value: '18px' },
        sm: { value: '14px' },
        xs: { value: '12px' },
      },
      radii: {
        card: { value: '2px' },
      },
    },
    semanticTokens: {
      colors: {
        primary: { value: '{colors.blurple}' },
        accent: { value: '{colors.caribbean}' },
        text: { value: '{colors.charcoal}' },
        textMuted: { value: '{colors.minersCoal}' },
        border: { value: '{colors.cloud}' },
        bg: { value: '{colors.air}' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
```

### 4.5 State Management

**TanStack Query** handles all server-state (knowledge entries, conversations, handbooks). Query keys follow `[resource, id?, filters?]` pattern.

**Zustand** stores are used for:

- `useInboxStore` — escalation notification queue (list of pending escalations to render toasts), unread badge count.
- `useParentChatStore` — message list, streaming state, session info.

### 4.6 API Client

Single Axios instance at `src/lib/apiClient.ts`:

- Base URL from `VITE_API_URL` env var.
- Request interceptor: attaches `Authorization: Bearer <accessToken>` from local storage.
- Response interceptor: on 401, attempts silent refresh via `POST /auth/refresh`, retries original request once, then redirects to `/login`.

---

## 5. Infrastructure & Deployment

### 5.1 Render Services

Defined in `render.yaml` (Render IaC):

| Service | Type | Build command | Start command |
|---|---|---|---|
| `api` | Web Service | `pnpm --filter api build` | `node dist/main.js` |
| `web` | Static Site | `pnpm --filter web build` | — |
| `db` | PostgreSQL (managed) | — | — |

Object Storage: one Render Object Storage bucket (`brightwheel-handbooks`). Credentials injected as env vars into the `api` service.

### 5.2 Environment Variables

#### API (`apps/api/.env`)

```
DATABASE_URL=postgresql://...
DATABASE_URL_TEST=postgresql://...  # separate test DB
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RENDER_STORAGE_ENDPOINT=https://...
RENDER_STORAGE_ACCESS_KEY=
RENDER_STORAGE_SECRET_KEY=
RENDER_STORAGE_BUCKET=brightwheel-handbooks
PORT=3000
NODE_ENV=development
```

#### Web (`apps/web/.env`)

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 5.3 Local Development

A `docker-compose.yml` at the repo root provides:

- `postgres` service with pgvector extension, port 5432.
- `postgres-test` service on port 5433, used exclusively by Jest.

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: brightwheel
      POSTGRES_USER: bw
      POSTGRES_PASSWORD: bw
    ports: ["5432:5432"]

  postgres-test:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: brightwheel_test
      POSTGRES_USER: bw
      POSTGRES_PASSWORD: bw
    ports: ["5433:5432"]
```

---

## 6. Testing Strategy

### 6.1 Philosophy

- Tests run against a **real PostgreSQL test database** (`DATABASE_URL_TEST`).
- Only **external services** are mocked: OpenAI SDK, Anthropic SDK, and the Render Storage client (`StorageService`).
- No in-memory databases; no mocked TypeORM repositories.
- Each test suite uses a shared test app instance with DB seeding/teardown via helper utilities.

### 6.2 Test Structure

```
apps/api/
├── src/
│   └── **/*.spec.ts        # Unit tests for pure logic (certainty scoring, text parsing)
└── test/
    ├── helpers/
    │   ├── app.helper.ts   # Creates NestJS test app, applies migrations
    │   ├── db.helper.ts    # Truncates tables between suites
    │   └── factories/      # TypeORM entity factories (school, user, knowledge, etc.)
    └── **/*.e2e-spec.ts     # Integration tests for each module's REST endpoints
```

### 6.3 Integration Test Pattern

```typescript
// test/knowledge.e2e-spec.ts
describe('KnowledgeModule (e2e)', () => {
  let app: INestApplication;
  let db: DataSource;

  beforeAll(async () => {
    ({ app, db } = await createTestApp());
  });

  beforeEach(async () => {
    await truncateAll(db);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /schools/:id/knowledge creates entry and generates embedding', async () => {
    const { school, token } = await seedSchoolWithAdmin(db);
    // OpenAI embed is mocked; returns a fixed 1536-dim vector
    const res = await request(app.getHttpServer())
      .post(`/schools/${school.id}/knowledge`)
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What are your hours?', answer: 'Mon–Fri 7am–6pm' });

    expect(res.status).toBe(201);
    const entry = await db.getRepository(KnowledgeEntry).findOneBy({ id: res.body.data.id });
    expect(entry.embedding).toHaveLength(1536);
  });
});
```

### 6.4 Mocking External Services

Use Jest module mocking at the `AIService` and `StorageService` class level:

```typescript
// In test app setup
jest.mock('../src/ai/ai.service');
jest.mock('../src/storage/storage.service');

AIService.prototype.embed = jest.fn().mockResolvedValue(new Array(1536).fill(0.01));
AIService.prototype.generateResponse = jest.fn().mockResolvedValue({
  content: 'Mock response',
  certaintyScore: 0.9,
});
StorageService.prototype.upload = jest.fn().mockResolvedValue('https://storage/test/file.pdf');
```

### 6.5 Jest Configuration

```typescript
// apps/api/jest.config.ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  coverageDirectory: '../coverage',
};

// apps/api/jest-e2e.config.ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
};
```

---

## 7. CI/CD

### 7.1 Backend CI (`.github/workflows/api-ci.yml`)

Triggers on push/PR affecting `apps/api/**` or `packages/shared/**`.

```yaml
name: API CI
on:
  push:
    paths: ['apps/api/**', 'packages/shared/**']
  pull_request:
    paths: ['apps/api/**', 'packages/shared/**']

jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: brightwheel_test
          POSTGRES_USER: bw
          POSTGRES_PASSWORD: bw
        ports: ['5433:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - name: Type check
        run: pnpm --filter api tsc --noEmit
      - name: Lint
        run: pnpm --filter api eslint src --ext .ts
      - name: Run tests
        env:
          DATABASE_URL_TEST: postgresql://bw:bw@localhost:5433/brightwheel_test
          JWT_ACCESS_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
          # External services are mocked; these are placeholders
          OPENAI_API_KEY: test
          ANTHROPIC_API_KEY: test
          RENDER_STORAGE_ENDPOINT: http://localhost
          RENDER_STORAGE_ACCESS_KEY: test
          RENDER_STORAGE_SECRET_KEY: test
          RENDER_STORAGE_BUCKET: test
        run: pnpm --filter api test:e2e && pnpm --filter api test
```

### 7.2 Frontend CI (`.github/workflows/web-ci.yml`)

Triggers on push/PR affecting `apps/web/**` or `packages/shared/**`.

```yaml
name: Web CI
on:
  push:
    paths: ['apps/web/**', 'packages/shared/**']
  pull_request:
    paths: ['apps/web/**', 'packages/shared/**']

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - name: Type check
        run: pnpm --filter web tsc --noEmit
      - name: Lint
        run: pnpm --filter web eslint src --ext .ts,.tsx
```

---

## 8. Key Implementation Notes

### Streaming to WebSocket

The AI generation step uses Anthropic's streaming SDK. The `ChatGateway` subscribes to the stream and forwards tokens to the parent socket in real time:

```typescript
for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    socket.emit('message:token', { token: event.delta.text, messageId });
  }
}
socket.emit('message:complete', { messageId, certaintyScore, wasEscalated });
```

### pgvector Migration

TypeORM does not natively support the `vector` column type. Use a custom migration to:
1. `CREATE EXTENSION IF NOT EXISTS vector;`
2. Add the column as `vector(1536)` in raw SQL.
3. Register a custom TypeORM column type for `vector` in `DatabaseModule`.

### Handbook Diff Storage

When a new handbook is uploaded and extracted, the proposed changes are stored as a `handbook_diffs` JSON column on the `Handbook` entity (not yet in `knowledge_entries`). Once the admin confirms, `HandbooksService.applyDiff()` executes the accepted inserts/updates/deletes atomically within a TypeORM transaction.

### Escalation Notification Delivery

When `AIService.generateResponse()` returns a score below threshold, `ConversationsService.flagForEscalation()`:
1. Updates `conversation.status = NEEDS_ATTENTION`.
2. Emits `conversation:escalated` to the `school:{schoolId}` socket.io room in the `/notifications` namespace.
3. All operator clients connected to that room (any logged-in staff for the school) receive the popup event.

---

## 9. Open Items

- **Base inquiry enforcement:** Determine whether `isActive` gate is enforced server-side (API rejects parent chat if base inquiries incomplete) or only in the onboarding UI.
- **Rate limiting:** Add `@nestjs/throttler` to parent-facing endpoints to prevent abuse.
- **PDF text extraction accuracy:** `pdf-parse` may struggle with image-heavy or scanned PDFs. Evaluate fallback to OCR (e.g., Tesseract) or Anthropic's vision input.
- **Handbook file MIME validation:** Enforce PDF/DOCX/TXT server-side; do not rely solely on file extension.
- **pgvector index:** Add `ivfflat` or `hnsw` index on `knowledge_entries.embedding` once data volume warrants it (> ~1000 entries per school). Start without an index.
- **Token budget for generation:** Large knowledge bases could overflow context. Implement a max token guard on the retrieved context passed to the Anthropic model.
