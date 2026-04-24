import 'server-only';

import { OkrHttpRepository } from '@/src/Infrastructure/Persistence/OkrHttpRepository';
import { DdlServerRepository } from '@/src/Infrastructure/ExternalServices/DdlProxyClient';
import { GeminiLlmProvider } from '@/src/Infrastructure/ExternalServices/GeminiLlmProvider';

import { GetDashboardUseCase } from '@/src/Application/UseCases/Okr/GetDashboardUseCase';
import { ListOrgNodesUseCase } from '@/src/Application/UseCases/Ddl/ListOrgNodesUseCase';
import { ListAssessmentSetsUseCase } from '@/src/Application/UseCases/Ddl/ListAssessmentSetsUseCase';

/**
 * Hand-rolled Dependency Injection container.
 *
 * Lazy singletons; no external library. Infrastructure implementations are
 * bound to domain interfaces here — the **only** place both names appear
 * together. All other code depends on the interface side only.
 *
 * Import this module only from Server Components, route handlers, or
 * Interface-layer Controllers. Never from client code.
 */
class Container {
  // ─── Repositories ───────────────────────────────────────────────────────
  private _okrRepo?: OkrHttpRepository;
  get okrRepository(): OkrHttpRepository {
    return (this._okrRepo ??= new OkrHttpRepository());
  }

  private _ddlRepo?: DdlServerRepository;
  get ddlRepository(): DdlServerRepository {
    return (this._ddlRepo ??= new DdlServerRepository());
  }

  // ─── LLM providers ──────────────────────────────────────────────────────
  private _gemini?: GeminiLlmProvider;
  get geminiLlm(): GeminiLlmProvider {
    return (this._gemini ??= new GeminiLlmProvider());
  }

  // ─── Use cases ──────────────────────────────────────────────────────────
  private _getDashboard?: GetDashboardUseCase;
  get getDashboardUseCase(): GetDashboardUseCase {
    return (this._getDashboard ??= new GetDashboardUseCase(this.okrRepository));
  }

  private _listOrgNodes?: ListOrgNodesUseCase;
  get listOrgNodesUseCase(): ListOrgNodesUseCase {
    return (this._listOrgNodes ??= new ListOrgNodesUseCase(this.ddlRepository));
  }

  private _listAssessmentSets?: ListAssessmentSetsUseCase;
  get listAssessmentSetsUseCase(): ListAssessmentSetsUseCase {
    return (this._listAssessmentSets ??= new ListAssessmentSetsUseCase(this.ddlRepository));
  }
}

export const container = new Container();
