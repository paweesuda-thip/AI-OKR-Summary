/**
 * Progress value object.
 *
 * Encapsulates the canonical OKR progress invariants pinned in `OKR_API_DOCS.md`:
 *   - value must lie in the closed interval [0, 100]
 *   - display MUST use `Math.floor` (the source system truncates; `Math.round`
 *     and `toFixed(0)` diverge from the upstream UI).
 *
 * Framework-free: must never depend on `react`, `next`, or any infrastructure.
 */
export class Progress {
  private constructor(public readonly value: number) {}

  static of(raw: number | null | undefined): Progress {
    const n = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
    const clamped = Math.min(100, Math.max(0, n));
    return new Progress(clamped);
  }

  /** Floor-based percent — matches the upstream truncation rule. */
  get display(): number {
    return Math.floor(this.value);
  }

  /**
   * Status bucket derived from the value, per the legacy mapper rules:
   *   >= 70 → On Track
   *   >= 40 → At Risk
   *   else  → Behind
   */
  get status(): 'On Track' | 'At Risk' | 'Behind' {
    if (this.value >= 70) return 'On Track';
    if (this.value >= 40) return 'At Risk';
    return 'Behind';
  }

  get impactLevel(): 'high' | 'medium' | 'low' {
    if (this.value >= 80) return 'high';
    if (this.value >= 60) return 'medium';
    return 'low';
  }
}
