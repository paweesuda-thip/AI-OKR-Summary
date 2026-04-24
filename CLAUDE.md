# CLAUDE.md — AI-OKR-Summary

> Project guide for contributors and AI assistants. Read this **before** adding code.

---

## 1. Project overview

AI-OKR-Summary is a Next.js 16 (App Router) dashboard that visualises OKR data from an upstream Empeo / Statio GoFive API and enriches it with AI-generated insights (Anthropic, Google Gemini, OpenAI, Hugging Face).

**Stack**

- Next.js 16 + React 19 (App Router, React Compiler, `--webpack`)
- TypeScript strict, `@/*` → project root, `@/src/*` for the layered architecture
- TanStack Query (client) + Next route handlers (server)
- shadcn/ui + Radix + TailwindCSS v4
- Multi-provider AI SDKs (`@ai-sdk/anthropic`, `@ai-sdk/openai`, `@google/genai`, `@huggingface/inference`)

---

## 2. Architecture at a glance

The project follows **Uncle Bob's Clean Architecture**, adapted for Next.js App Router. Four concentric layers with a one-way dependency rule:

```
          +-----------------------------+
          |        Interface            |   ← Next.js app/, Controllers, UI components, hooks
          |  +-----------------------+  |
          |  |    Infrastructure     |  |   ← Repositories, LLM providers, HTTP client, DI
          |  |  +-----------------+  |  |
          |  |  |   Application   |  |  |   ← UseCases, DTOs, service interfaces
          |  |  |  +-----------+  |  |  |
          |  |  |  |  Domain   |  |  |  |   ← Entities, ValueObjects, domain Interfaces, Exceptions
          |  |  |  +-----------+  |  |  |
          |  |  +-----------------+  |  |
          |  +-----------------------+  |
          +-----------------------------+
```

**The dependency rule:** code in an inner layer must never import from an outer layer. Concretely:

| Layer | May import from | May NOT import |
|---|---|---|
| `src/Domain` | nothing (pure TS) | `react`, `next`, `@ai-sdk/*`, `@google/genai`, `@huggingface/*`, `src/Application`, `src/Infrastructure`, `src/Interface` |
| `src/Application` | `src/Domain` | `next`, `react`, concrete LLM SDKs, any `src/Infrastructure` or `src/Interface` |
| `src/Infrastructure` | `src/Domain`, `src/Application` | `react`, `next/server` only inside route handler adapters, `src/Interface` |
| `src/Interface` | all three inner layers | — |

> **Why this matters:** the only way to swap Anthropic for OpenAI, or the HTTP upstream for gRPC, without touching business logic, is to keep `Domain` and `Application` free of framework/SDK imports.

---

## 3. Folder map

```
./
├── app/                              # Next.js App Router (Interface / delivery)
│   ├── layout.tsx, page.tsx
│   └── api/                          # Thin route handlers — each calls ONE controller
│       ├── ai-score/route.ts
│       ├── chat/route.ts
│       ├── compare/route.ts
│       ├── toonify/route.ts
│       └── ddl/{assessment-sets,org-node}/route.ts
├── src/
│   ├── Domain/
│   │   ├── Entities/                 # Okr, Objective, KeyResult, OrgNode, AssessmentSet
│   │   ├── ValueObjects/             # Progress, OkrStatus, ImpactLevel
│   │   ├── Interfaces/               # IOkrRepository, IDdlRepository, ILlmProvider, IToonifyService
│   │   └── Exceptions/               # UpstreamApiError, InvalidProgressError
│   ├── Application/
│   │   ├── UseCases/                 # Okr/, Ddl/, Ai/
│   │   ├── DTOs/                     # Raw input/output shapes, including raw upstream DTOs
│   │   └── Interfaces/               # IHttpClient (if the app needs an abstract client)
│   ├── Infrastructure/
│   │   ├── Persistence/              # HTTP repositories + Mappers (raw → Domain)
│   │   ├── ExternalServices/         # GeminiLlmProvider, DdlProxyClient, etc.
│   │   ├── Http/                     # FetchHttpClient (shared upstream helpers)
│   │   └── Providers/container.ts    # Hand-rolled DI: wires Interfaces → Implementations
│   └── Interface/
│       ├── Http/Controllers/         # One per resource; called from app/api/**/route.ts
│       ├── Presenters/               # Response formatters (NextResponse JSON, streams)
│       └── Ui/
│           ├── Components/
│           │   ├── Dashboard/        # dashboard.tsx, dashboard-topbar.tsx, dashboard-selectors.tsx, filter-bar.tsx, date-range-picker.tsx
│           │   ├── Okr/              # objectives-section, overview-cards, progress-update-section, period-comparison-section, versus-mode, check-in-engagement
│           │   ├── Ai/               # ai-score-section, ai-summary-panel, floating-ai-chat, ai-element/
│           │   └── Shared/           # providers, theme-provider, react-bits/
│           ├── Primitives/           # shadcn atoms (was components/ui/*)
│           ├── Hooks/                # useDashboardQuery, useDdlQuery, useParticipantQuery, useMobile
│           ├── utils/                # cn.ts, org-leaf.ts (UI-facing helpers)
│           └── queryClient.ts        # TanStack Query client factory
├── public/
├── .claude/skills/clean-architect/
│   ├── SKILL.md
│   └── references/
│       ├── nextjs-adaptation.md
│       └── layer-cheatsheet.md
└── CLAUDE.md                         # this file
```

---

## 4. Layer rules — what goes where

| I want to add… | Put it in… |
|---|---|
| A new business concept with identity (e.g. OKR, Objective) | `src/Domain/Entities/` |
| An immutable value with invariants (e.g. `Progress`, `DateRange`) | `src/Domain/ValueObjects/` |
| A contract for something the outside world provides | `src/Domain/Interfaces/` |
| A domain-specific error | `src/Domain/Exceptions/` |
| Business logic that orchestrates entities to fulfil a user intent | `src/Application/UseCases/<Feature>/` |
| A data structure that crosses a layer boundary | `src/Application/DTOs/` |
| A concrete HTTP / SDK implementation of a Domain interface | `src/Infrastructure/ExternalServices/` or `Persistence/` |
| A raw → domain mapper | `src/Infrastructure/Persistence/Mappers/` |
| Wiring (Interface → Implementation) | `src/Infrastructure/Providers/container.ts` |
| A Next.js route handler | `app/api/<resource>/route.ts` — **thin** |
| The code the route handler calls | `src/Interface/Http/Controllers/<Resource>Controller.ts` |
| A response formatter | `src/Interface/Presenters/` |
| A React feature component | `src/Interface/Ui/Components/<Feature>/` |
| A shadcn primitive | `src/Interface/Ui/Primitives/` |
| A client hook | `src/Interface/Ui/Hooks/` |

---

## 5. How to add a new feature (SOP)

Follow the innermost-first ordering so compilers catch layer leaks early.

1. **Entity** — add the type and any invariants in `src/Domain/Entities/`.
2. **Value objects** — if the feature introduces a constrained primitive (e.g. score `1..10`), model it.
3. **Domain interface** — define the contract for *how* the feature reaches the outside world (e.g. `IFeatureRepository`).
4. **Use case** — write `src/Application/UseCases/<Feature>/<Action>UseCase.ts`. It accepts the interface via its constructor and orchestrates domain objects.
5. **Implementation** — build the concrete repository / provider in `src/Infrastructure/` that implements the domain interface.
6. **Wiring** — register the binding in `src/Infrastructure/Providers/container.ts`.
7. **Controller** — `src/Interface/Http/Controllers/<Feature>Controller.ts`: parses input, calls use-case via the container, hands result to a presenter.
8. **Route handler** — create `app/api/<feature>/route.ts` with ~10 lines that delegate to the controller.
9. **UI** — add a client hook in `src/Interface/Ui/Hooks/` that calls the route; consume it from a component in `src/Interface/Ui/Components/<Feature>/`.

---

## 6. Next.js specifics

### Server vs Client components

- Default = **Server Component**. No `"use client"`.
- Add `"use client"` **only** when the file needs `useState` / `useEffect` / event handlers / browser APIs / TanStack Query hooks.
- A Server Component may render a Client Component child, not vice versa.

### Data fetching

| From where | How |
|---|---|
| Server Component | `import { container } from '@/src/Infrastructure/Providers/container'` → call a use-case directly. No HTTP hop. |
| Client Component | `useQuery` hook → `fetch('/api/<feature>')` → route handler → controller → use-case. |

### Route handlers must stay thin

```ts
// app/api/<feature>/route.ts
import { featureController } from '@/src/Interface/Http/Controllers/FeatureController';
export async function POST(req: Request) {
  return featureController.handle(req);
}
```

No business logic, no mapping, no retries — those belong in use-case / infrastructure.

### `"use client"` placement

Put it on the *smallest* component that actually needs it. The shared `Providers` component at `src/Interface/Ui/Components/Shared/providers.tsx` is the only global `"use client"` island.

---

## 7. Domain invariants — DO NOT DRIFT

These are pinned rules extracted from `OKR_API_DOCS.md` and enforced in code (mostly via `Progress` VO and `OkrMapper`):

1. `OkrDataRaw.progress` = team-aggregated progress (not person-specific).
2. `OkrObjectiveDetailRaw.progress` = team-aggregated sub-OKR progress.
3. `OkrDetailRaw.pointOKR` = per-person % progress for that KR — **not** a target/total denominator.
4. `OkrDetailRaw.pointCurrent` = raw points scored — **not** a percentage.
5. Never compute `pointCurrent / pointOKR` as a percentage.
6. Person-specific sub-OKR display: `avg(details[].pointOKR)`.
7. Person-specific sub-OKR for main-obj calc: `min(avg(pointOKR), sub.progress)` — caps by `sub.progress` to handle hidden 0% KRs.
8. Person-specific main-obj: `avg` of capped sub-OKR values across sub-OKRs where the person owns ≥1 KR.
9. **Display numbers must use `Math.floor()`** — the source system truncates; `Math.round` / `toFixed(0)` will diverge.

If you find these rules elsewhere in code, they should call `Progress` / `OkrMapper` instead of re-implementing.

---

## 8. Imports & path aliases

- `@/*` → project root. Use this for everything under `src/`, `app/`, `public/`.
- Prefer explicit layer paths: `@/src/Domain/Entities/Okr`, `@/src/Application/UseCases/Okr/GetDashboardUseCase`, etc.
- Avoid deep relative imports (`../../../`) — they tell you the layer rule is probably being broken.

---

## 9. Testing & conventions

- **Formatting:** follow existing style; do **not** reformat files you don't change.
- **Comments:** do not add or remove comments unless asked.
- **ESLint:** `npm run lint` must pass. `npm run build` must succeed.
- **No tests** are wired yet; when tests are added, `Domain` and `Application` should be covered first because they have zero framework dependencies.

---

## 10. Glossary

| Term | Meaning (in this project) |
|---|---|
| **Entity** | Object with identity (`id` / `objectiveId` / `keyId`). Lives in `Domain/Entities`. |
| **Value Object (VO)** | Immutable value identified by its data (e.g. `Progress(67)`). Two VOs are equal if their contents are equal. |
| **Use Case** | A single application-level action (`GetDashboardUseCase`, `GenerateSummaryUseCase`). Accepts dependencies via constructor. |
| **DTO** | Data-transfer shape that crosses a layer boundary. Never contains methods. |
| **Repository** | An implementation of a `Domain/Interfaces/I*Repository` contract — the only place that knows about fetch / SDK calls for that resource. |
| **Provider (Infra)** | An implementation of an `I*Service` / `ILlmProvider` contract — e.g. `GeminiLlmProvider`, `AnthropicLlmProvider`. |
| **Controller** | Pure function/class in `Interface/Http/Controllers` called by a route handler. Parses input → calls use-case → returns a presenter. |
| **Presenter** | Formats a use-case result into the delivery shape (JSON body, stream, etc.). |
| **Container** | Hand-rolled DI map in `Infrastructure/Providers/container.ts`. Lazy-singletons, no library. |

---

## 11. References

- [`.claude/skills/clean-architect/SKILL.md`](.claude/skills/clean-architect/SKILL.md) — architecture master rules.
- [`.claude/skills/clean-architect/references/nextjs-adaptation.md`](.claude/skills/clean-architect/references/nextjs-adaptation.md) — how Clean Arch maps onto Next.js App Router.
- [`.claude/skills/clean-architect/references/layer-cheatsheet.md`](.claude/skills/clean-architect/references/layer-cheatsheet.md) — quick "adding X → put it in Y" lookup.
- [`.claude/skills/nextjs-best-practices/SKILL.md`](.claude/skills/nextjs-best-practices/SKILL.md) — Next.js App Router principles.
- [`OKR_API_DOCS.md`](OKR_API_DOCS.md) — upstream API reference + progress semantics.
- [`GEMINI_INTEGRATION.md`](GEMINI_INTEGRATION.md) — Gemini LLM notes.
