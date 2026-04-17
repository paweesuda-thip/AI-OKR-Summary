import { NextResponse } from 'next/server';
import { DdlUpstreamError, fetchOrgNodesFromUpstream } from '@/lib/server/ddl-proxy';

export async function GET() {
  try {
    const payload = await fetchOrgNodesFromUpstream();
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof DdlUpstreamError) {
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

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch org node data',
      },
      { status: 500 },
    );
  }
}
