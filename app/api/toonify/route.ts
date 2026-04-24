import { toonifyController } from '@/src/Interface/Http/Controllers/ToonifyController';

export async function POST(req: Request) {
  return toonifyController.handle(req);
}
