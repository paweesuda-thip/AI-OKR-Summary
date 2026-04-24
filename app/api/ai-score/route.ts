import { aiScoreController } from '@/src/Interface/Http/Controllers/AiScoreController';

export const maxDuration = 60;

export async function POST(req: Request) {
  return aiScoreController.handle(req);
}
