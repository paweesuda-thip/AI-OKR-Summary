# Data Mappers in Clean Architecture

## Overview
In the context of the Gravito Clean Architecture used in this project, **Mappers** (or Data Mappers) play a crucial role in the **Infrastructure / Persistence Layer**. They act as translators between external data sources (like HTTP APIs) and the internal Domain Entities that the core application expects.

An excellent example of this pattern is the `extractData` function found in `src/Infrastructure/Persistence/DdlHttpRepository.ts` and similar repositories.

## Example: `extractData` Mapper

```typescript
// src/Infrastructure/Persistence/DdlHttpRepository.ts

function extractData<T>(payload: unknown): T[] {
  // Handle direct array responses
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  
  // Handle nested object responses (lowercase 'data')
  if (Array.isArray(record.data)) return record.data as T[];
  
  // Handle nested object responses (uppercase 'Data')
  if (Array.isArray(record.Data)) return record.Data as T[];

  return [];
}
```

## Why do we need Mappers?

### 1. API Normalization (Handling Inconsistencies)
Different endpoints from external APIs often return data in different formats. For instance:
- Direct Arrays: `[ { id: 1 }, { id: 2 } ]`
- Wrapped in lowercase `data`: `{ "status": 200, "data": [ { id: 1 } ] }`
- Wrapped in uppercase `Data`: `{ "Status": 200, "Data": [ { id: 1 } ] }`

The Mapper acts as a normalizer. It "unwraps" these varying JSON payloads and consistently returns a clean array (`T[]`), abstracting away the unpredictability of the external API.

### 2. Protecting the Core Domain
The core business logic (Application UseCases, Domain Interfaces) should not know or care about HTTP status envelopes, pagination wrappers, or external JSON casing conventions.
By implementing the Mapper inside the Repository, we ensure that the Domain Layer only ever interacts with strictly-typed data (e.g., `OrgNodeDto[]` or `AssessmentSetDto[]`). The Mapper serves as a strict boundary checkpoint protecting the inner layers from external infrastructure details.

### 3. Reusability and DRY (Don't Repeat Yourself)
By centralizing the extraction logic into a single generic Mapper (`extractData<T>`), multiple API calls within the same repository can share the same mapping logic without duplicating `if/else` checks for `payload.data` or `payload.Data`. This keeps the actual data-fetching functions clean and focused strictly on the network request parameters.
