# Brightwheel AI Front Desk

> *"More time with children. Less time on admin."*

An AI-powered front desk embedded in each school's Brightwheel presence that
answers parent inquiries 24/7 using the school's own knowledge base. When the
AI is not confident in an answer, it escalates to a human staff member in real
time — without leaving the parent in a dead end.

📄 **[Product Spec](product-spec.md)** · 🛠️ **[Tech Spec](tech-spec.md)**

---

## What it does

Early education staff spend hours every week answering the same parent
questions — hours, tuition, illness policy, nap schedule, drop-off procedure.
Parents, in turn, often ask outside business hours and wait days for a reply.
The AI Front Desk solves both sides:

- **Parents** get instant, friendly answers grounded in their school's actual
  policies via a standalone chat page at `mybrightwheel.com/chat/{school-slug}`.
- **School admins** stand up the system in minutes by uploading their existing
  handbook (PDF/DOCX/TXT) or filling in a guided wizard of 12 base inquiries.
- **Staff** are notified in real time only when the AI's certainty falls below
  a configurable threshold (default 80%), and reply directly from the operator
  inbox.

See [product-spec.md](product-spec.md) for full personas, flows, and v1 scope
boundaries.

---

## How the system learns

The knowledge base is a living asset. It grows through three feedback paths,
each reinforcing the next:

### 1. Handbook ingestion
On upload, `claude-sonnet-4-6` parses the document and produces structured
Q&A pairs — one per topic — along with the source excerpt and a confidence
rating (high/medium/low). Admins review every row in an editable table before
anything is published. Re-uploading a handbook produces a **diff view** (new /
changed / removed) so updates are auditable and reversible. Old versions are
retained in handbook history.

### 2. Manual entry
Admins can add or refine Q&A pairs at any time through the knowledge base
editor. Every create or answer-edit triggers a fresh `text-embedding-3-small`
embedding so the entry is immediately searchable via semantic similarity.

### 3. Resolved escalations
When a staff member resolves an escalated conversation, they're prompted:
*"Would you like to add this Q&A to your knowledge base so the AI can handle
it next time?"* Accepting pre-fills a new entry from the parent's question and
the staff reply, which the admin confirms before it goes live.

Together, these three paths create a continuous improvement loop — over time
the AI handles more inquiries autonomously, and escalations concentrate on the
genuinely novel questions.

---

## Technical overview

A yarn workspaces monorepo deploying to Render. Full details in
[tech-spec.md](tech-spec.md).

| Layer | Stack |
|-------|-------|
| Frontend | React 18 + TypeScript, Vite, Chakra UI v3 (Brightwheel design tokens), TanStack Query, Zustand, `socket.io-client` |
| Backend | NestJS + TypeScript, TypeORM, `@nestjs/websockets` over `socket.io` |
| Database | PostgreSQL 16 with `pgvector` for semantic similarity search |
| AI | OpenAI `text-embedding-3-small` (1536-dim) for retrieval; Anthropic `claude-sonnet-4-6` for generation and handbook extraction |
| Storage | AWS S3 for handbook files |
| Hosting | Render — web service for the API, static site for the web app, managed Postgres |
| Auth | JWT (operator + parent session tokens) |
| Testing | Jest + Supertest against a real PostgreSQL test database; only third-party SDKs are mocked |

### Repository layout
```
brightwheel/
├── be/                  # NestJS backend
├── web/                 # React frontend (Vite)
├── packages/shared/     # Shared TypeScript DTOs and enums
├── product-spec.md
├── tech-spec.md
├── render.yaml
└── docker-compose.yml   # Local Postgres + pgvector for dev and test
```

### How a parent message flows
1. Parent opens `/chat/{school-slug}`; client requests a 24h JWT and opens a
   `socket.io` connection on the `/chat` namespace.
2. On `message:send`, the backend embeds the query and runs a pgvector cosine
   similarity search to retrieve the top-k Q&A pairs for that school.
3. `claude-sonnet-4-6` generates a streamed response grounded in those pairs;
   tokens are forwarded to the parent socket as `message:token` events.
4. A composite **certainty score** (`0.7 * topSimilarity + 0.3 * coverage`)
   accompanies each completed message. If it falls below the school's
   threshold, the conversation is flagged and a `conversation:escalated`
   event is broadcast to the school's operator room on the `/notifications`
   namespace.

---

## Running locally

```bash
# Start Postgres (with pgvector) and the test DB
docker compose up -d

# Install dependencies
yarn install

# Run dev servers
yarn workspace be start:dev      # NestJS on :3000
yarn workspace web dev           # Vite on :5173

# Quality checks (CI enforces these)
yarn typecheck                   # type-checks both web and be
yarn lint                        # lints both web and be
yarn test                        # backend unit tests
yarn test:e2e                    # backend integration tests
```

Required env vars (see `tech-spec.md` §5.2): `DATABASE_URL`,
`DATABASE_URL_TEST`, `JWT_SECRET`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and
the AWS S3 credentials (`AWS_REGION`, `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`).

---

## How we built this with Claude

This project was scoped, designed, and implemented end-to-end with Claude as
the lead collaborator. Each phase used a different mode of working with the
model:

### 1. Product scoping & ideation
We started from a one-line problem statement — *"early education staff are
drowning in repetitive parent inquiries."* Through a back-and-forth
conversation with Claude we explored the problem space, sketched personas
(parent, admin, staff), brainstormed feature shapes (24/7 chat, handbook
ingestion, certainty-based escalation), and stress-tested the v1 scope by
explicitly listing **non-goals** (no voice, no embeddable widget, no
cross-school sharing, English-only). The output of this phase is captured in
[product-spec.md](product-spec.md), which Claude drafted, refined across
several review passes, and structured to be implementation-ready.

### 2. Technical design
With the product spec stable, we worked with Claude to translate it into a
buildable system: choosing the stack (NestJS + React + Postgres + pgvector),
designing the entity schema, mapping REST endpoints and WebSocket events, and
deciding the certainty-scoring formula. Claude proposed the composite
similarity-plus-coverage score, the `pendingDiff` JSONB pattern for handbook
re-upload reviews, and the `school:{schoolId}` socket.io room model for
scoped operator notifications. The full spec lives in
[tech-spec.md](tech-spec.md).

### 3. Implementation
[Claude Code](https://claude.com/claude-code) drives the day-to-day build
work. The conventions in [`CLAUDE.md`](CLAUDE.md) — one component per file,
one interface per file, real test database, no mocking of internal services,
singular table names, icons over text labels — are loaded into every session
so the agent stays consistent across the codebase. CI on every PR enforces
the same standards (`yarn typecheck`, `yarn lint`, `yarn test`,
`yarn test:e2e`).

### 4. The Anthropic SDK in production
The same model powering our development workflow (`claude-sonnet-4-6`) is the
generation model behind the AI Front Desk itself, used for both streaming
parent responses and structured handbook extraction. Embedding-based retrieval
is handled by OpenAI's `text-embedding-3-small`.

---

*See [product-spec.md](product-spec.md) and [tech-spec.md](tech-spec.md) for
the full source-of-truth documents.*
