// Simulated clock with configurable speed multiplier.
// At speed=1 (real-time), simulated time matches wall-clock time.
// At speed=24, one real hour = one simulated day (for circadian testing).

export class SimulatedClock {
  private realStartTime: number
  private simStartTime: number
  private speedMultiplier: number

  constructor(speedMultiplier = 1) {
    this.realStartTime = Date.now()
    this.simStartTime = Date.now()
    this.speedMultiplier = speedMultiplier
  }

  /**
   * Get the current simulated time as a Date.
   */
  getSimulatedTime(): Date {
    const realElapsed = Date.now() - this.realStartTime
    const simElapsed = realElapsed * this.speedMultiplier
    return new Date(this.simStartTime + simElapsed)
  }

  /**
   * Get the simulated hour as a fractional value (0-23.99).
   * Used for circadian modulation.
   */
  getSimulatedHour(): number {
    const simTime = this.getSimulatedTime()
    return simTime.getHours() + simTime.getMinutes() / 60 + simTime.getSeconds() / 3600
  }

  /**
   * Change the speed multiplier while preserving the current simulated time.
   * This avoids a time jump when changing speed.
   */
  setSpeed(multiplier: number): void {
    const currentSimTime = this.getSimulatedTime().getTime()
    this.realStartTime = Date.now()
    this.simStartTime = currentSimTime
    this.speedMultiplier = multiplier
  }

  /**
   * Get the current speed multiplier.
   */
  getSpeed(): number {
    return this.speedMultiplier
  }

  /**
   * Reset to current wall-clock time.
   */
  reset(): void {
    this.realStartTime = Date.now()
    this.simStartTime = Date.now()
  }
}
