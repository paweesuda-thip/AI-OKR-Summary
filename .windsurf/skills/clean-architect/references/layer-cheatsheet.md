# Layer cheatsheet — "adding X → put it in Y"

Quick lookup for the most common additions to this codebase.

---

## Adding business concepts

| X = I want to add… | Y = put it in… | Notes |
|---|---|---|
| A new resource with identity | `src/Domain/Entities/<Name>.ts` | E.g. `Objective`, `KeyResult`, `Participant`. Must have `id` field. |
| A constrained primitive | `src/Domain/ValueObjects/<Name>.ts` | Immutable. Throw on invalid construction. |
| An invariant (e.g. progress 0–100 + floor on display) | Method on the related VO or Entity | Never spread the rule across layers. |
| A new kind of error | `src/Domain/Exceptions/<Name>Error.ts` | Extend `Error`; never throw raw strings. |

## Adding actions

| X = I want to add… | Y = put it in… |
|---|---|
| A new operation a user triggers (button, page load, API call) | `src/Application/UseCases/<Feature>/<Verb><Noun>UseCase.ts` |
| A shape that crosses layers | `src/Application/DTOs/<Name>Dto.ts` |
| A contract for *how* the outside world provides data | `src/Domain/Interfaces/I<Name>Repository.ts` or `I<Name>Service.ts` |

## Integrating the outside world

| X | Y |
|---|---|
| A new upstream HTTP API | `src/Infrastructure/Persistence/<Name>HttpRepository.ts` implementing a Domain interface |
| A new LLM provider | `src/Infrastructure/ExternalServices/<Name>LlmProvider.ts` implementing `ILlmProvider` |
| A raw-response → domain-entity mapper | `src/Infrastructure/Persistence/Mappers/<Name>Mapper.ts` |
| Shared HTTP helpers | `src/Infrastructure/Http/FetchHttpClient.ts` |
| Env var reads | Inside the infra implementation's constructor / factory — never in Domain/Application |

## Wiring

| X | Y |
|---|---|
| A binding `IFoo` → `FooHttpRepository` | `src/Infrastructure/Providers/container.ts` |
| A lazy singleton | Add `get<name>()` getter on the container object |
| Multiple implementations of one interface (env-gated) | Branch inside the container factory |

## Delivery

| X | Y |
|---|---|
| A new HTTP endpoint | `app/api/<resource>/route.ts` — thin; delegates to a controller |
| Logic the route handler calls | `src/Interface/Http/Controllers/<Resource>Controller.ts` |
| Response formatting (JSON shape, streaming, headers) | `src/Interface/Presenters/<Name>Presenter.ts` |
| A Server Action | `src/Interface/Actions/<verbNoun>.ts` with `'use server'` |

## UI

| X | Y |
|---|---|
| A shadcn primitive | `src/Interface/Ui/Primitives/<name>.tsx` |
| A feature component | `src/Interface/Ui/Components/<Feature>/<Name>.tsx` |
| Cross-cutting UI (providers, theming, animations) | `src/Interface/Ui/Components/Shared/` |
| A reusable React hook | `src/Interface/Ui/Hooks/use<Name>.ts` |
| A TanStack Query hook | Same — it's just a hook; its queryFn hits `/api/…`. |
| A UI-only util (e.g. `cn`) | `src/Interface/Ui/utils/<name>.ts` |
| A data-shape util used by both Domain and UI | Push it into Domain/VO; UI imports from Domain |

## Decision flow for an ambiguous addition

```
Is it a pure rule about the business (no framework, no fetch, no React)?
├── yes → Domain (Entity / VO / Exception)
└── no → Is it a user-triggered operation?
        ├── yes → Application/UseCases
        └── no → Does it touch the outside world (HTTP, SDK, env)?
                ├── yes → Infrastructure
                └── no → It's UI → src/Interface/Ui
```

---

## Red flags

- A file under `src/Domain/` that imports from `react`, `next`, `@ai-sdk/*`, `@google/genai`, or any `@/src/Application|Infrastructure|Interface/*` path. **Fix:** move the offending logic out, or invert the dependency via a new `Interfaces/` contract.
- A file under `app/api/**/route.ts` longer than ~30 lines. **Fix:** move the bulk into a controller + use-case.
- `process.env.*` read anywhere outside `src/Infrastructure/` or `next.config.ts`. **Fix:** read in an infra constructor and pass down.
- Two files re-implementing the same progress/percent/status rule. **Fix:** centralise in a VO or Mapper under Domain/Infrastructure.
