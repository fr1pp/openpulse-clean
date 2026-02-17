// Ornstein-Uhlenbeck mean-reverting vital sign generator
// Discrete OU process: x_{n+1} = x_n + theta * (mu - x_n) * dt + sigma * sqrt(dt) * N(0,1)

export interface OUParams {
  theta: number   // Mean reversion speed (higher = faster reversion)
  mu: number      // Long-term mean (baseline, adjusted by circadian)
  sigma: number   // Volatility (stdDev of noise)
  dt: number      // Time step in arbitrary units (1 per tick)
}

/**
 * Box-Muller transform for standard normal distribution N(0,1).
 */
export function gaussianRandom(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

/**
 * Single discrete Ornstein-Uhlenbeck step.
 * Returns the next value given current value and OU parameters.
 */
export function ouStep(current: number, params: OUParams): number {
  const { theta, mu, sigma, dt } = params
  const drift = theta * (mu - current) * dt
  const diffusion = sigma * Math.sqrt(dt) * gaussianRandom()
  return current + drift + diffusion
}

/**
 * Clamp a vital value to physiological bounds.
 */
const VITAL_BOUNDS: Record<string, [number, number]> = {
  heartRate:   [20, 200],
  bpSystolic:  [60, 260],
  bpDiastolic: [30, 160],
  spo2:        [60, 100],
  temperature: [34, 42],
}

export function clampVital(value: number, vitalType: string): number {
  const bounds = VITAL_BOUNDS[vitalType]
  if (!bounds) return value
  return Math.max(bounds[0], Math.min(bounds[1], value))
}
