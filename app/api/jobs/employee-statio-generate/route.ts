import { statioJobsController } from '@/src/Interface/Http/Controllers/StatioJobsController';

export async function POST(req: Request) {
  return statioJobsController.triggerEmployeeStatioGenerate(req);
}
