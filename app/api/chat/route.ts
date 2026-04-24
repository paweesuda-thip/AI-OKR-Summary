import { chatController } from '@/src/Interface/Http/Controllers/ChatController';

export const maxDuration = 30;

export async function POST(req: Request) {
  return chatController.handle(req);
}
