import { compareController } from '@/src/Interface/Http/Controllers/CompareController';

export const maxDuration = 300;

export async function POST(req: Request) {
  return compareController.handle(req);
}
