import { ddlController } from '@/src/Interface/Http/Controllers/DdlController';

export async function GET() {
  return ddlController.listOrgNodes();
}
