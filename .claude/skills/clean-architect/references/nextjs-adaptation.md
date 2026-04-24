# Clean Architecture — Next.js App Router adaptation

> Companion to `SKILL.md`. Describes how the four canonical layers map onto a Next.js App Router project.

---

## 1. Physical vs logical layout

Next.js **requires** `app/` to live at the project root; it cannot be moved into `src/`. So `app/` is physically at `./app` but **logically** part of the `Interface` layer — it is the *delivery* slice (HTTP route handlers + the root React tree).

```
./app                 → Interface (delivery only — pages, layouts, route handlers)
./src/Interface       → Interface (controllers, presenters, UI components, hooks)
./src/Infrastructure  → Infrastructure
./src/Application     → Application
./src/Domain          → Domain
```

Everything under `app/` should be **thin**. Business logic belongs in `src/Application/UseCases`.

---

## 2. Route handler template (thin)

```ts
// app/api/<resource>/route.ts
import { NextResponse } from 'next/server';
import { <resource>Controller } from '@/src/Interface/Http/Controllers/<Resource>Controller';

export const maxDuration = 60; // only if needed

export async function POST(req: Request) {
  return <resource>Controller.handle(req);
}
```

Rules:

- No `fetch` to upstream APIs here — that belongs in a `Repository`.
- No prompt-building or JSON-repair here — that belongs in a `Provider`.
- Catch *only* at the controller/presenter level; the route handler should merely forward.

---

## 3. Controller template

```ts
// src/Interface/Http/Controllers/<Resource>Controller.ts
import { NextResponse } from 'next/server';
import { container } from '@/src/Infrastructure/Providers/container';

export const <resource>Controller = {
  async handle(req: Request): Promise<Response> {
    try {
      const input = await req.json();
      const output = await container.<useCase>.execute(input);
      return NextResponse.json(output);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Internal error' },
        { status: 500 },
      );
    }
  },
};
```

The controller may import `NextResponse` (it *is* delivery). It must not import any `@google/genai` / `@ai-sdk/*` / `fetch`-wrapping code directly — those are reached via the `container`.

---

## 4. Server Components as use-case callers

When a Server Component needs data, skip the HTTP round-trip — import the container directly:

```tsx
// app/dashboard/page.tsx  (Server Component)
import { container } from '@/src/Infrastructure/Providers/container';

export default async function DashboardPage() {
  const data = await container.getDashboardOkrUseCase.execute({
    assessmentSetId: 1,
    organizationId: 2,
  });
  return <DashboardView data={data} />;
}
```

Rule: Server Components may call **use cases**, never repositories or SDKs directly.

---

## 5. Client Components + TanStack Query

Client Components stay framework-coupled by necessity. The rule: they are allowed to touch `fetch('/api/…')`, but the **transformation** of that response must go through Domain/Application code.

```ts
// src/Interface/Ui/Hooks/useDashboardQuery.ts
'use client';
import { useQuery } from '@tanstack/react-query';

export function useDashboardQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => fetch('/api/okr/dashboard', { method: 'POST', body: JSON.stringify(params) })
      .then(r => r.json()),
  });
}
```

The raw payload is already a Domain-shaped DTO because the route handler returns what the use-case returned.

---

## 6. `"use client"` placement

| File | Directive |
|---|---|
| `app/layout.tsx`, `app/page.tsx` | none (Server) |
| `app/api/**/route.ts` | none (Server) |
| `src/Interface/Ui/Components/Shared/providers.tsx` | `'use client'` — lifts the query + theme context |
| Feature components with hooks (dashboard, filter bar, charts) | `'use client'` |
| `src/Interface/Ui/Primitives/*` | `'use client'` per shadcn convention when they use Radix hooks |

Rule of thumb: the `"use client"` boundary should sit on the *smallest* component that actually needs it.

---

## 7. Data fetch caching

| Pattern | Where |
|---|---|
| `fetch(url, { cache: 'no-store' })` | Inside `Infrastructure/Persistence/*Repository.ts` — the repository is the authority on freshness for its resource. |
| `revalidateTag(tag)` | Inside a Server Action, after a successful use-case invocation. |
| `revalidate` export | On Server Component pages, for ISR. |

Never set cache options inside route handlers or controllers.

---

## 8. Server Actions

A Server Action is just a use-case called from a form. The wrapper lives in `src/Interface/Actions/` (new folder — create when first needed):

```ts
// src/Interface/Actions/updateProgress.ts
'use server';
import { container } from '@/src/Infrastructure/Providers/container';

export async function updateProgress(formData: FormData) {
  await container.updateProgressUseCase.execute({
    keyId: Number(formData.get('keyId')),
    value: Number(formData.get('value')),
  });
}
```

---

## 9. Anti-patterns in a Next.js Clean Arch project

| ❌ Don't | ✅ Do |
|---|---|
| Put `fetch(...)` inside a route handler | Put it in `Infrastructure/Persistence/*Repository.ts` |
| Import `@google/genai` / `@ai-sdk/*` in `Application` | Define `ILlmProvider` in `Domain/Interfaces/` and implement in `Infrastructure/ExternalServices/` |
| Call a repository from a Client Component | Call `/api/...` and let the route handler → controller → use-case → repository chain run |
| Use `'use client'` on a whole feature tree | Push it down to the smallest interactive leaf |
| Add `process.env.X` reads in `Domain`/`Application` | Read env only in `Infrastructure` (provider / repository constructor) |
| Throw raw SDK errors up to UI | Map to `Domain/Exceptions/*` inside the provider / repository |
