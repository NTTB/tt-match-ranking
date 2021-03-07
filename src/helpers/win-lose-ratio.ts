/**
 * @internal
 * Describes the win/lose ratio
 */
export class WinLoseRatio {
  /**
   * @param won The amount of wins
   * @param lost The amount of loses
   */
  constructor(public readonly won: number, public readonly lost: number) {}

  /**
   * Calculates the ratio of won and lost games.
   */
  get ratio(): number {
    return this.won / this.lost;
  }

  /**
   * Helper property that returns an empty WinLoseRatio.
   */
  static get Zero(): WinLoseRatio {
    return new WinLoseRatio(0, 0);
  }

  /**
   * Sums the WinLoseRatio
   * @param ratios The ratios that needs to be added together
   * @returns A new WinLoseRatio
   */
  static sum(...ratios: WinLoseRatio[]): WinLoseRatio {
    const won = ratios.reduce((pv, cv) => pv + cv.won, 0);
    const lost = ratios.reduce((pv, cv) => pv + cv.lost, 0);
    return new WinLoseRatio(won, lost);
  }
}
