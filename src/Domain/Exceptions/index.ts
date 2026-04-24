/**
 * Domain-level exceptions.
 *
 * Infrastructure adapters translate SDK/network errors into one of these so
 * the Application and Interface layers never see framework-specific errors.
 */

export class UpstreamApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText?: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'UpstreamApiError';
  }
}

export class LlmProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'LlmProviderError';
  }
}

export class MissingConfigurationError extends Error {
  constructor(public readonly key: string) {
    super(`Missing required configuration: ${key}`);
    this.name = 'MissingConfigurationError';
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}
