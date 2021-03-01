export class TTRatio {
  constructor(public readonly won: number, public readonly lost: number) {}

  get ratio(): number {
    return this.won / this.lost;
  }
  static get Zero(): TTRatio {
    return new TTRatio(0, 0);
  }

  static sum(...ratios: TTRatio[]): TTRatio {
    const won = ratios.reduce((pv, cv) => pv + cv.won, 0);
    const lost = ratios.reduce((pv, cv) => pv + cv.lost, 0);
    return new TTRatio(won, lost);
  }
}
