import 'server-only';
import { NextResponse } from 'next/server';
import { container } from '@/src/Infrastructure/Providers/container';
import { UpstreamApiError } from '@/src/Domain/Exceptions';

/**
 * Controller for POST /api/jobs/employee-statio-generate.
 *
 * Body shape: { assessmentSetId: number; organizationId: number }
 *
 * Forwards to the upstream Empeo job; returns 202 on success since the
 * upstream call kicks off async backend processing.
 */
export const statioJobsController = {
  async triggerEmployeeStatioGenerate(req: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { assessmentSetId, organizationId } = (body ?? {}) as {
      assessmentSetId?: unknown;
      organizationId?: unknown;
    };

    if (typeof assessmentSetId !== 'number' || typeof organizationId !== 'number') {
      return NextResponse.json(
        { error: 'assessmentSetId and organizationId must be numbers' },
        { status: 400 },
      );
    }

    try {
      const result = await container.triggerEmployeeStatioGenerateUseCase.execute({
        assessmentSetId,
        organizationId,
      });
      // Forward the upstream status + body verbatim so the client sees the
      // real response (e.g. 200 + "added to queue") instead of a synthetic one.
      return NextResponse.json(result.body, { status: result.status });
    } catch (err) {
      if (err instanceof UpstreamApiError) {
        return NextResponse.json(
          { error: err.message, upstream: err.payload ?? null },
          { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
        );
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('triggerEmployeeStatioGenerate failed:', err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
};
