import { TTMatch } from "./tt-match";

export interface TTMatchRank<T> {
  ranked: TTPlayerRank<T>[];
}

export interface TTPlayerRank<T> {
  id: number;
  player: T;
}

export function generateMatchRank<T>(
  match: TTMatch<T>
): TTMatchRank<T> {
  const hasTooManyUnplayedMatches: number[] = getPlayersWithTooManyUnplayedMatches<T>(match);
  const ranked: TTPlayerRank<T>[] = match.getPlayers().filter(x => !hasTooManyUnplayedMatches.includes(x.id));
  return { ranked };
}

function getPlayersWithTooManyUnplayedMatches<T>(match: TTMatch<T>) {
  const hasTooManyUnplayedMatches: number[] = [];

  match.getPlayers().forEach(({ id }) => {
    let expectedSetCounter = 0;
    let unplayedSetCounter = 0;
    match.getSets()
      .filter(({ homePlayerId, awayPlayerId }) => id === homePlayerId || id === awayPlayerId)
      .forEach(({ set }) => {
        expectedSetCounter++;

        if (set.walkover) {
          unplayedSetCounter++;
        }

      });

    const requiredSetCount = Math.ceil(expectedSetCounter / 2);
    if (unplayedSetCounter > 0 && unplayedSetCounter >= requiredSetCount) {
      hasTooManyUnplayedMatches.push(id);
    }
  });
  return hasTooManyUnplayedMatches;
}
