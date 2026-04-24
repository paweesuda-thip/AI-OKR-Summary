import { NextResponse } from 'next/server';
import { container } from '@/src/Infrastructure/Providers/container';
import { presentError } from '@/src/Interface/Presenters/errorPresenter';

/**
 * Controllers for the `/api/ddl/*` endpoints.
 *
 * Parses the HTTP request, calls the corresponding use case via the DI
 * container, and returns the payload wrapped in the status envelope that the
 * client-side DdlHttpRepository expects.
 */
export const ddlController = {
  async listOrgNodes(): Promise<Response> {
    try {
      const data = await container.listOrgNodesUseCase.execute();
      return NextResponse.json({
        status: { code: '1000', description: 'Success' },
        data,
      });
    } catch (err) {
      return presentError(err);
    }
  },

  async listAssessmentSets(): Promise<Response> {
    try {
      const data = await container.listAssessmentSetsUseCase.execute();
      return NextResponse.json({
        status: { code: '1000', description: 'Success' },
        data,
      });
    } catch (err) {
      return presentError(err);
    }
  },
};
