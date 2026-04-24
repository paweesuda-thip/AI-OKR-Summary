/**
 * Abstraction over third-party LLM SDKs (Anthropic, Gemini, OpenAI, ...).
 *
 * Domain / Application code depends on this contract, never on a concrete SDK.
 * Swapping providers means changing the binding in the DI container.
 */
export interface LlmTextRequest {
  system?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ILlmProvider {
  /** Returns true if the provider has the credentials it needs to run. */
  isConfigured(): boolean;

  /** Produce freeform text — used by chat and short completions. */
  generateText(req: LlmTextRequest): Promise<string>;

  /**
   * Produce JSON with retry + tolerant parsing (fenced blocks, truncation
   * repair, …). Returns `null` when parsing ultimately fails so the caller
   * can degrade gracefully.
   */
  generateJson<T = unknown>(req: LlmTextRequest & { maxAttempts?: number; label?: string }): Promise<T | null>;
}
