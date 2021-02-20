import { TTGameRules, TTMatchRules, TTSetRules } from "./rules";
import { getSetWinner } from "./tt-set";
import { TTMatch } from "./tt-match";

export interface TTMatchRank<T> {
  ranked: TTPlayerRank<T>[];
}

export interface TTPlayerRank<T> {
  id: number;
  player: T;
  points: number;
}

export function generateMatchRank<T>(match: TTMatch<T>, matchRules: TTMatchRules, setRules: TTSetRules): TTMatchRank<T> {
  const hasTooManyUnplayedMatches: number[] = getPlayersWithTooManyUnplayedMatches<T>(
    match
  );
  const rankedPlayers = match
    .getPlayers()
    .filter((x) => !hasTooManyUnplayedMatches.includes(x.id));

  const unrankedPlayers = match.getPlayers().filter(p => !rankedPlayers.some(rp => rp.id === p.id));

  const rankedSets = match.getSets()
    .filter(s => !unrankedPlayers.some(p => p.id === s.awayPlayerId || p.id === s.homePlayerId));

  const ranks = rankedPlayers.map((x): TTPlayerRank<T> => {
    return {
      id: x.id,
      player: x.player,
      points: 0
    };
  });

  rankedSets.forEach(matchSet => {
    const winner = getSetWinner(matchSet.set, setRules);
    const pointChanges: { id: number, score: number }[] = [];
    if (winner == "home") {
      pointChanges.push({ id: matchSet.homePlayerId, score: matchRules.victoryPoints });
      pointChanges.push({ id: matchSet.awayPlayerId, score: matchRules.defeatPoints });
    }
    if (winner == "away") {
      pointChanges.push({ id: matchSet.awayPlayerId, score: matchRules.victoryPoints });
      pointChanges.push({ id: matchSet.homePlayerId, score: matchRules.defeatPoints });
    }

    pointChanges.forEach(change => {
      const rank = ranks.find(x => x.id == change.id);
      if (rank) {
        rank.points += change.score;
      } else {
        throw new Error("Unable to find ranked player of ranked match");
      }
    });
  });

  const sortedRanks = ranks.sort((a, b) => b.points - a.points);
  return { ranked: sortedRanks };
}

function getPlayersWithTooManyUnplayedMatches<T>(match: TTMatch<T>) {
  const hasTooManyUnplayedMatches: number[] = [];

  match.getPlayers().forEach(({ id }) => {
    let expectedSetCounter = 0;
    let unplayedSetCounter = 0;
    match
      .getSets()
      .filter(
        ({ homePlayerId, awayPlayerId }) =>
          id === homePlayerId || id === awayPlayerId
      )
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
