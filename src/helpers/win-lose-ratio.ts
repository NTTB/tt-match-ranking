export class WinLoseRatio {
  constructor(public readonly won: number, public readonly lost: number) {}

  get ratio(): number {
    return this.won / this.lost;
  }

  static get Zero(): WinLoseRatio {
    return new WinLoseRatio(0, 0);
  }

  static sum(...ratios: WinLoseRatio[]): WinLoseRatio {
    const won = ratios.reduce((pv, cv) => pv + cv.won, 0);
    const lost = ratios.reduce((pv, cv) => pv + cv.lost, 0);
    return new WinLoseRatio(won, lost);
  }
}
