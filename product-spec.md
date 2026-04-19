# Product Spec: AI Front Desk for Early Education Centers

## Overview

### Problem Statement

School administrators and staff at early education centers spend significant time fielding repetitive parent inquiries — questions about hours, tuition, enrollment policies, daily schedules, and curriculum. This administrative burden pulls staff away from children and core operations. Parents, meanwhile, often send inquiries outside business hours and wait hours or days for a response.

### Proposed Solution

An AI-powered front desk embedded in each school's Brightwheel presence that automatically answers parent inquiries 24/7 using the school's own knowledge base. When the AI isn't confident in an answer, it escalates to a human staff member in real time. School admins build and maintain the knowledge base either by uploading their existing handbook or by entering Q&A pairs manually.

### Product Tagline

> "More time with children. Less time on admin." *(consistent with Brightwheel brand voice)*

---

## Goals

| Goal | Metric |
|------|--------|
| Reduce repetitive staff inquiry time | ≥60% of incoming inquiries resolved without human intervention within 90 days |
| Improve parent response time | Median first response time < 30 seconds for AI-handled inquiries |
| Maintain answer quality | Human escalation rate stabilizes below threshold as knowledge base matures |
| Enable continuous improvement | Admins actively maintain knowledge base (≥1 update/month per school) |

---

## User Personas

### 1. Parent / Guardian
The primary end user of the chat interface. Asks questions before enrollment, during enrollment, and throughout the school year. Often contacts the school outside business hours. Values fast, accurate, friendly responses.

### 2. School Admin
Sets up the AI front desk during onboarding. Owns the knowledge base. Receives escalation notifications for inquiries the AI cannot confidently answer. Can hand off to any staff member. Wants to reduce inbox volume without sacrificing parent experience.

### 3. School Staff
Responds to escalated inquiries on behalf of the admin. May not have access to full admin settings, but can view flagged conversations and respond directly.

---

## Features

### 1. School Onboarding & Knowledge Base Setup

#### 1.1 Base Inquiry Set

Every school must provide answers to a standardized set of common inquiries before the AI front desk goes live. These cover the most frequently asked parent questions across early education:

**Required base inquiries:**
- Operating hours (open/close times, holiday schedule)
- Tuition rates and payment schedule
- Enrollment process and availability
- Age groups and classroom structure
- Drop-off and pick-up procedures
- Meals and snack policy (provided vs. packed)
- Illness and sick-child policy
- Communication and daily report cadence
- Staff-to-child ratios and teacher qualifications
- Outdoor and physical activity policy
- Emergency and safety procedures
- Waitlist process

Schools must provide answers to all base inquiries before the AI front desk is activated.

#### 1.2 Onboarding Flow — Manual Entry Path

1. Admin signs into Brightwheel and opens the **AI Front Desk** setup from the main navigation.
2. A guided step-by-step wizard presents each base inquiry one at a time.
3. Admin types the answer in a rich text field; character count and a "preview as parent" toggle are available.
4. Progress is saved automatically after each answer.
5. Admin can skip and return to any incomplete item.
6. Once all base inquiries are answered, the system activates the AI front desk and presents a shareable chat link.

#### 1.3 Onboarding Flow — Handbook Upload Path

1. Admin is presented with the option to upload their school handbook (PDF, DOCX, or plain text, max 50 MB).
2. The system uses an AI document pipeline to:
   - Extract answers to all base inquiries from the handbook text.
   - Generate additional Q&A pairs covering any other distinct topics found in the handbook (e.g., nap policy, field trip permissions, photo release).
3. Admin reviews the AI-extracted answers in an editable table:
   - Each row shows: **Question**, **AI-extracted Answer**, **Source excerpt** (highlighted passage from the handbook), **Confidence** (High / Medium / Low).
   - Admin can accept, edit, or delete any row.
   - Any base inquiries not found in the handbook are flagged as "Needs your answer" and the admin completes them manually.
4. Once all base inquiries are resolved, the front desk activates.

---

### 2. Parent-Facing Chat Interface

#### 2.1 Embed & Access

The AI front desk is accessible via:
- A **standalone chat page** hosted at `mybrightwheel.com/chat/{school-slug}` — sharable in email signatures, websites, and enrollment packets.
- An **embeddable widget** (JavaScript snippet) for schools that want the chat on their own website.

#### 2.2 Chat Experience

- A chat bubble appears in the lower-right corner of the page on load (or can be pre-opened for the standalone page).
- The widget header shows the school name, logo, and a status indicator: **"Typically replies instantly"**.
- The parent types a message in the input bar and submits via Enter or the send button.
- Responses stream in real time using WebSockets — the parent sees a typing indicator while the AI composes its response, then the message appears token-by-token.
- Conversation is session-persistent (stored in browser `localStorage`) so the parent can return without losing context.
- A "Start new conversation" button resets the session.
- Parents can optionally provide their name and email at the start for follow-up (prompted, not required).

#### 2.3 Responsive Design

The chat interface is fully responsive:
- **Mobile (< 640px):** Full-screen modal overlay.
- **Tablet (640–1024px):** Side panel taking 50% width.
- **Desktop (> 1024px):** Fixed chat panel, 420px wide, anchored bottom-right.

---

### 3. AI Response Engine

#### 3.1 Knowledge Retrieval

Each incoming parent message is matched against the school's knowledge base using semantic similarity search (vector embeddings). The top-k most relevant Q&A pairs are retrieved as context for the AI model.

#### 3.2 Response Generation

The AI generates a response grounded in the retrieved context. The system prompt instructs the model to:
- Only answer based on the school's knowledge base.
- Maintain a warm, friendly, professional tone consistent with the school's brand.
- Never fabricate information not present in the knowledge base.
- If a question is out of scope, acknowledge it and invite the parent to call or email the school directly.

#### 3.3 Certainty Scoring

Every AI response is accompanied by an internal certainty score between **0.0 and 1.0**, computed from:
- Semantic similarity of the best-matching knowledge base entry to the parent's query.
- The model's own expressed confidence (via logprobs or structured output).
- Whether the retrieved context directly addresses the question or only partially overlaps.

The certainty score is **not shown to the parent**. It is used exclusively for escalation routing (see Section 4).

#### 3.4 Configurable Escalation Threshold

School admins can configure the certainty threshold in **Settings → AI Front Desk → Escalation Threshold**. The default is **0.80** (80%). Any response with a certainty score below the threshold triggers an escalation notification.

Threshold options are presented as a labeled slider:
- 0.60 — "Escalate less (handle more automatically)"
- 0.80 — "Recommended"
- 0.95 — "Escalate more (prioritize human review)"

---

### 4. Human Escalation System

#### 4.1 Escalation Trigger

When the AI generates a response with certainty < threshold, the system:
1. **Still sends the AI response to the parent**, appended with a note: *"If this doesn't fully answer your question, a team member will follow up shortly."*
2. **Flags the conversation** for human review.
3. **Notifies all active staff members** (admins + staff with AI Front Desk permissions).

This approach avoids leaving the parent in a dead-end while ensuring a human reviews the interaction.

#### 4.2 Operator Notification — Real-Time Popup

In the Brightwheel operator web app, a non-intrusive notification appears for any logged-in staff member when a conversation is escalated:

```
┌─────────────────────────────────────────────────┐
│  🔔  New inquiry needs your attention           │
│  Sarah M. asked about your waitlist process.    │
│  AI confidence: 62% · 2 minutes ago             │
│                                                 │
│  [View Conversation]        [Dismiss]           │
└─────────────────────────────────────────────────┘
```

- The popup appears in the top-right of the screen and auto-dismisses after 30 seconds if not interacted with.
- A persistent badge count appears on the **AI Front Desk** icon in the sidebar navigation.
- Clicking **View Conversation** opens the full conversation thread in the operator inbox.

#### 4.3 Operator Inbox

The operator inbox lists all conversations, filterable by:
- **Needs attention** (AI certainty < threshold, no human reply yet)
- **In progress** (staff member has replied)
- **Resolved**

Each conversation card shows:
- Parent name (if provided) or "Anonymous"
- First message preview
- AI certainty score (shown as a colored badge: red < 60%, amber 60–79%, green ≥ 80%)
- Time elapsed since last message
- Assigned staff member (if any)

#### 4.4 Staff Reply Flow

1. Staff opens the conversation.
2. They see the full chat history, including the AI's response and the certainty score.
3. They type a reply in the response box; the message is delivered to the parent's chat window in real time.
4. Staff can mark the conversation **Resolved** when complete.
5. Resolved conversations feed back into the knowledge base improvement workflow (see Section 5.3).

#### 4.5 Push & Email Notifications

In addition to in-app notifications, staff receive:
- **Push notifications** (browser or mobile) if they have notifications enabled.
- **Email digest** of unresolved escalations if no action is taken within 1 hour (configurable).

---

### 5. Knowledge Base Management

#### 5.1 Knowledge Base Editor

Accessible at **Settings → AI Front Desk → Knowledge Base**. The editor is a searchable table of all Q&A pairs with columns:

| Question | Answer | Source | Last Updated | Actions |
|----------|--------|--------|--------------|---------|
| What are your hours? | We're open Mon–Fri, 7am–6pm. | Handbook p.2 | Apr 12, 2026 | Edit · Delete |
| Do you provide meals? | Yes, we provide... | Manual entry | Mar 3, 2026 | Edit · Delete |

- **Search** filters rows by keyword.
- **Filter by source:** Handbook / Manual / AI-generated.
- **Edit** opens an inline editor. Changes take effect immediately.
- **Delete** removes the Q&A pair after a confirmation prompt.
- **Add new Q&A** opens a form with Question and Answer fields.

#### 5.2 Handbook Re-Upload

Admins can re-upload an updated handbook at any time:

1. Navigate to **Settings → AI Front Desk → Handbook**.
2. Click **Replace Handbook** and upload the new file.
3. The AI re-processes the document and presents a **diff view** showing:
   - New Q&A pairs (green) — proposed additions.
   - Changed answers (amber) — AI detected an update; shows old vs. new.
   - Removed topics (red) — content no longer found in the new handbook.
4. Admin reviews and accepts/rejects each change individually or in bulk.
5. On confirmation, the knowledge base is updated and the AI immediately uses the new content.

Previous handbook versions are retained and can be restored from **Handbook History**.

#### 5.3 Learning from Escalations

When a staff member resolves an escalated conversation, they are prompted:

> *"Would you like to add this Q&A to your knowledge base so the AI can handle it next time?"*

- **Yes → Add to knowledge base:** The system pre-fills a new Q&A pair using the parent's question and the staff member's reply. The admin reviews and confirms before it goes live.
- **No thanks:** Dismissed. The conversation is marked resolved with no knowledge base change.

This creates a continuous improvement loop where the knowledge base grows organically from real parent interactions.

---

## User Flows

### Flow A: School Onboarding (Handbook Upload)

```
Admin opens AI Front Desk setup
  → Selects "Upload handbook"
  → Uploads PDF
  → AI processes document (~30–60 seconds, progress indicator shown)
  → Admin reviews extracted Q&A pairs
    → Edits / accepts / deletes rows
    → Completes any unfilled base inquiries manually
  → Confirms and activates
  → Receives shareable chat link + embed snippet
```

### Flow B: Parent Asks a Question

```
Parent opens chat (standalone page or widget)
  → Types question
  → AI retrieves relevant knowledge base entries
  → AI generates response
  → Certainty score computed
    → Score ≥ threshold → Response sent to parent, no escalation
    → Score < threshold → Response sent with follow-up note
                        → Escalation notification sent to staff
```

### Flow C: Staff Handles Escalated Inquiry

```
Staff sees notification popup in operator app
  → Clicks "View Conversation"
  → Reviews chat history and AI response
  → Types reply → Parent receives in real time
  → Staff marks Resolved
  → Prompted to add Q&A to knowledge base
```

### Flow D: Admin Updates Knowledge Base

```
Admin navigates to Settings → AI Front Desk → Knowledge Base
  → Searches for existing entry
  → Edits answer inline
  → OR: Uploads new handbook → Reviews diff → Confirms changes
  → AI uses updated knowledge base immediately
```

---

## Technical Architecture

### Frontend
- **Framework:** React (TypeScript)
- **Styling:** Tailwind CSS configured with Brightwheel design tokens (see Design System section)
- **Real-time:** WebSocket connection via native browser `WebSocket` API or Socket.io client
- **Chat widget:** Iframe-embeddable, communicates with parent frame via `postMessage`
- **State management:** Zustand for operator inbox state; React Query for server state

### Backend
- **API:** REST + WebSocket server (Node.js / Fastify or Python / FastAPI)
- **Auth:** Brightwheel existing session tokens; JWT for parent chat sessions
- **Database:** PostgreSQL for conversations, Q&A pairs, school settings
- **Vector store:** pgvector extension for semantic similarity search on knowledge base embeddings
- **File storage:** S3-compatible object storage for handbook PDFs

### AI Layer
- **Embedding model:** `text-embedding-3-small` (OpenAI) or equivalent for knowledge base indexing and query matching
- **Generation model:** `claude-sonnet-4-6` (Anthropic) for response generation and handbook extraction
- **Streaming:** Server-sent events (SSE) from AI model forwarded to parent via WebSocket
- **Certainty scoring:** Composite score from cosine similarity of top retrieved chunk + model confidence signal

### Infrastructure
- **Hosting:** AWS (ECS Fargate for API, CloudFront for static assets)
- **Queue:** SQS for async handbook processing jobs
- **Notifications:** WebSocket push for in-app; AWS SES for email digests; Web Push API for browser notifications

---

## Design System

All UI components must match the Brightwheel design system exactly.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Blurple (Primary) | `#5463D6` | Primary buttons, links, active states |
| Caribbean (Accent) | `#29B9BB` | Highlights, progress indicators, chat bubbles (school) |
| Charcoal | `#18181D` | Body text |
| Graphite | `#5C5E6A` | Secondary text, labels |
| Miners Coal | `#737685` | Muted text, placeholders |
| Cloud | `#EBEFF4` | Dividers, borders |
| Air | `#F7F9FB` | Background (dim), message bubbles (parent) |
| White | `#FFFFFF` | Surface, card backgrounds |
| Joker (Success) | `#3BBA6E` | Resolved state, high-confidence badge |
| Lemon (Warning) | `#FECC38` | Medium-confidence badge |
| Strawberry (Error) | `#CF193A` | Low-confidence badge, error states |
| Blackout | `#1E2549` | High-contrast headers |

### Typography

- **Font family:** `"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif`
- **H1:** 70px / semi-bold (600)
- **H2:** 36px / semi-bold (600)
- **H3:** 22px / semi-bold (600)
- **Body:** 18px / regular (400) / line-height 1.4
- **Small / labels:** 14px / regular (400)
- **XS / captions:** 12px / regular (400)

### Components

**Buttons**
- Primary: `background: #5463D6`, `color: #FFFFFF`, `border-radius: 2px`, `padding: 15px 23px 14px`, `font-weight: 600`
- Secondary: `background: transparent`, `border: 1px solid #5463D6`, `color: #5463D6`
- Hover transition: `all 0.3s ease-in-out`

**Chat Bubbles**
- Parent message: `background: #F7F9FB`, `color: #18181D`, `border-radius: 2px`, right-aligned
- AI / school message: `background: #5463D6`, `color: #FFFFFF`, `border-radius: 2px`, left-aligned
- Timestamp: 12px / `#737685`, displayed below bubble

**Notification Popup**
- `background: #FFFFFF`, `border-left: 4px solid #5463D6`, `box-shadow: 0 4px 16px rgba(0,0,0,0.12)`
- `border-radius: 2px`, `padding: 16px 20px`
- Dismiss animation: slide out right, `0.3s ease-in-out`

**Certainty Badges**
- High (≥ 80%): `background: #E9F8EF`, `color: #3BBA6E`
- Medium (60–79%): `background: #FFF9E5`, `color: #896507`
- Low (< 60%): `background: #FFF6F5`, `color: #CF193A`

**Input Fields**
- `border: 1px solid #EBEFF4`, `border-radius: 2px`, `padding: 12px 16px`
- Focus: `border-color: #5463D6`, `outline: none`, `box-shadow: 0 0 0 3px rgba(84,99,214,0.15)`

---

## Non-Goals (v1)

- **Multi-language support** — English only for initial release.
- **Voice or phone AI** — Text chat only.
- **Native mobile app** — Responsive web only; native app integration is a later phase.
- **CRM / lead capture integration** — Parent contact info is stored locally; no Salesforce or HubSpot sync.
- **AI proactively initiating conversations** — The AI only responds to parent-initiated messages.
- **Cross-school knowledge sharing** — Each school's knowledge base is fully isolated.

---

## Open Questions

1. **Pricing model:** Is AI Front Desk an add-on SKU, or included in existing Brightwheel tiers? What's the per-message cost model given LLM API costs?
2. **COPPA / FERPA compliance:** Parents interacting with AI are adults, but conversations may reference children. What data retention limits apply?
3. **Handbook IP:** Schools own their handbook content. What are the terms around storing and processing it? Can Brightwheel use anonymized Q&A data to improve shared models?
4. **Multi-campus schools:** How does the knowledge base work for schools with multiple locations that share one Brightwheel account?
5. **Handoff visibility:** Should parents be informed they're speaking with an AI? (Recommended: yes, for trust and regulatory compliance.)
6. **SLA for escalated inquiries:** Should Brightwheel surface a metric for "median time to staff response" and alert admins if escalations go unanswered too long?

---

## Milestones

### Phase 1 — Core (Weeks 1–6)
- School onboarding flow (both paths: manual + handbook upload)
- Knowledge base editor
- Parent chat interface (standalone page)
- AI response engine with certainty scoring
- Basic escalation: email notification to admin

### Phase 2 — Operator Experience (Weeks 7–10)
- Operator inbox with real-time notifications
- In-app popup notifications
- Staff reply flow with real-time delivery to parent
- Resolved → knowledge base suggestion loop

### Phase 3 — Polish & Embed (Weeks 11–14)
- Embeddable widget (JS snippet)
- Handbook re-upload with diff review
- Push notifications (browser)
- Handbook version history
- Analytics dashboard: resolution rate, avg certainty, top questions

---

*Last updated: April 19, 2026*
