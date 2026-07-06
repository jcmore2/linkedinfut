// Diminishing-returns curve: 0 stays 0, and score approaches 99 as value
// grows past `halfLife`. These half-life constants (passed in by callers)
// are initial guesses — they haven't been calibrated against a real
// distribution of profiles yet, so treat resulting numbers as illustrative,
// not authoritative.
export function scale(value: number, halfLife: number): number {
  const raw = 99 * (1 - Math.exp(-value / halfLife));
  return Math.min(88, Math.round(raw)); // raw stats cap at 88, mirrors GitFut's "legacy gate"
}
