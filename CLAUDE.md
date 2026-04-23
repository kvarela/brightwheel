# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Brightwheel AI Front Desk** — an AI-powered chat system embedded in each school's Brightwheel presence that answers parent inquiries 24/7 using the school's own knowledge base. When AI confidence falls below a configurable threshold, it escalates to human staff in real time. Full product spec lives in `product-spec.md`.

This repository is in the pre-implementation phase. No application code exists yet.

---

## Planned Technical Architecture

### Frontend
- **Framework:** React (TypeScript)
- **Component library:** Chakra UI v3 extended with Brightwheel design tokens
- **Real-time:** Native browser `WebSocket` API
- **State management:** Zustand (operator inbox), React Query (server state)

### Backend
- **Framework:** NestJS (TypeScript), REST API
- **Auth:** Brightwheel session tokens for operators; JWT for parent chat sessions
- **Database:** PostgreSQL with `pgvector` extension for semantic similarity search
- **File storage:** Render Object Storage for handbook PDFs

### AI Layer
- **Embedding model:** `text-embedding-3-small` (OpenAI) for knowledge base indexing and query matching
- **Generation model:** `claude-sonnet-4-6` (Anthropic) for response generation and handbook extraction
- **Streaming:** Server-sent events (SSE) forwarded to parent via WebSocket
- **Certainty scoring:** Composite of cosine similarity of top retrieved chunk + model confidence signal (0.0–1.0); default escalation threshold is 0.80

### Infrastructure
- **Hosting:** Render — NestJS web service, static site for React frontend, managed PostgreSQL
- **Notifications:** WebSocket push for in-app real-time notifications to operators

---

## Key Domain Concepts

- **Knowledge base:** Per-school collection of Q&A pairs. Populated via manual entry or AI extraction from an uploaded handbook (PDF/DOCX/TXT). Used as RAG context for every parent query.
- **Base inquiries:** 12 required Q&A pairs every school must complete before the AI front desk activates (hours, tuition, enrollment, illness policy, etc.).
- **Certainty score:** Internal 0.0–1.0 score on every AI response. Never shown to parents; used only for escalation routing. Configurable threshold per school (default 0.80).
- **Escalation:** When certainty < threshold, the AI response is still sent (with a follow-up caveat), the conversation is flagged, and all active staff are notified in real time.
- **Operator inbox:** Three states — `Needs attention` (escalated, no staff reply), `In progress`, `Resolved`. Resolved conversations prompt staff to add Q&A to the knowledge base.

---

## Design System

All UI must match the Brightwheel design system exactly.

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Blurple (Primary) | `#5463D6` | Primary buttons, links, active states |
| Caribbean (Accent) | `#29B9BB` | Progress indicators, AI chat bubbles |
| Charcoal | `#18181D` | Body text |
| Graphite | `#5C5E6A` | Secondary text, labels |
| Miners Coal | `#737685` | Muted text, placeholders |
| Cloud | `#EBEFF4` | Dividers, borders |
| Air | `#F7F9FB` | Page backgrounds, parent message bubbles |
| White | `#FFFFFF` | Card surfaces |
| Joker (Success) | `#3BBA6E` | Resolved state, high-confidence badge |
| Lemon (Warning) | `#FECC38` | Medium-confidence badge |
| Strawberry (Error) | `#CF193A` | Low-confidence badge, error states |
| Blackout | `#1E2549` | High-contrast headers |

### Typography
- **Font:** `"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif`
- H1: 70px / 600 | H2: 36px / 600 | H3: 22px / 600
- Body: 18px / 400 / line-height 1.4 | Small/labels: 14px | XS/captions: 12px

### Key Component Specs
- **Buttons — Primary:** `background: #5463D6`, white text, `border-radius: 2px`, `padding: 15px 23px 14px`, weight 600, hover `all 0.3s ease-in-out`
- **Buttons — Secondary:** transparent background, `border: 1px solid #5463D6`, Blurple text
- **Chat bubbles — Parent:** `background: #F7F9FB`, `color: #18181D`, `border-radius: 2px`, right-aligned
- **Chat bubbles — AI/School:** `background: #5463D6`, white text, `border-radius: 2px`, left-aligned
- **Input fields:** `border: 1px solid #EBEFF4`, `border-radius: 2px`, `padding: 12px 16px`; focus: `border-color: #5463D6`, `box-shadow: 0 0 0 3px rgba(84,99,214,0.15)`
- **Notification popup:** white background, `border-left: 4px solid #5463D6`, `box-shadow: 0 4px 16px rgba(0,0,0,0.12)`, `border-radius: 2px`; auto-dismisses after 30s, slides out right on dismiss
- **Certainty badges — High (≥80%):** `background: #E9F8EF`, `color: #3BBA6E` | **Medium (60–79%):** `background: #FFF9E5`, `color: #896507` | **Low (<60%):** `background: #FFF6F5`, `color: #CF193A`

---

## Chat Interface Responsive Breakpoints
- Mobile `< 640px`: full-screen modal overlay
- Tablet `640–1024px`: side panel, 50% width
- Desktop `> 1024px`: fixed panel, 420px wide, anchored bottom-right

## v1 Scope Boundaries (Non-Goals)
English only. Text chat only. No embeddable widget (standalone page at `mybrightwheel.com/chat/{school-slug}` only). No browser push or email notifications (in-app WebSocket only). No cross-school knowledge sharing. AI only responds — never initiates.

---

## Development Standards

### Repository Structure
This is a yarn workspaces monorepo:
- `web/` — React + TypeScript + Chakra UI v3 (Vite)
- `be/` — NestJS + TypeScript + TypeORM + PostgreSQL
- `packages/shared/` — Shared TypeScript types (DTOs, enums)

### Frontend Standards
- **One component per file.** Every React component lives in its own `.tsx` file. No barrel-style files that define multiple components.
- **One interface per file.** Every TypeScript interface lives in its own `.ts` file under a `interfaces/` or `types/` directory co-located with the feature it belongs to.
- **Type check and lint must pass before pushing.** Run `yarn typecheck` and `yarn lint` from either the `web/` directory or the monorepo root before every push. CI enforces this.

### Backend Standards
- **Unit tests required for all new features and bug fixes.** Every new service method, controller route, or utility added to the backend must have a corresponding `.spec.ts` unit test. Only external services (OpenAI, Anthropic, S3, etc.) are mocked; the test database is real.
- **Tests must pass before pushing.** Run `yarn test` from the `be/` directory or the monorepo root before every push. CI enforces this.
- **Test database:** Unit and integration tests run against `brightwheel_test` via `DATABASE_URL_TEST`. The schema is recreated fresh on each test run via `dropSchema: true` + `synchronize: true` in the TypeORM test config. Never mock the database in tests.

### Running checks locally
```bash
# From monorepo root
yarn typecheck   # type-checks both web and be
yarn lint        # lints both web and be
yarn test        # runs be unit tests
yarn test:e2e    # runs be integration tests

# From individual workspaces
cd web && yarn typecheck && yarn lint
cd be  && yarn test && yarn test:e2e
```
