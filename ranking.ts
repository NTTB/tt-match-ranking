export interface Rank {
  score: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  gamePointsWon: number;
  gamePointsLost: number;
}

export function sortRanking(ranks: Rank[]): Rank[] {
  return [];
}