import { NextResponse } from 'next/server';
import { UpstreamApiError, MissingConfigurationError, InvalidInputError, LlmProviderError } from '@/src/Domain/Exceptions';

/**
 * Map a domain/infrastructure error to a Next.js JSON response.
 *
 * Keeps the mapping in one place so all route handlers behave consistently.
 */
export function presentError(error: unknown): Response {
  if (error instanceof UpstreamApiError) {
    return NextResponse.json(
      {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        upstreamPayload: error.payload ?? null,
      },
      { status: error.status || 502 },
    );
  }

  if (error instanceof MissingConfigurationError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof InvalidInputError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof LlmProviderError) {
    return NextResponse.json(
      { error: error.message, provider: error.provider },
      { status: 502 },
    );
  }

  const message = error instanceof Error ? error.message : 'Internal error';
  return NextResponse.json({ error: message }, { status: 500 });
}
