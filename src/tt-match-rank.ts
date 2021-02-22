import { TTMatchRules, TTSetRules } from "./rules";
import { getSetWinner } from "./tt-set";
import { TTMatch, TTMatchSet } from "./tt-match";

export interface TTMatchRank<T> {
  ranked: TTPlayerRank<T>[];
}

export interface TTPlayerRank<T> {
  id: number;
  player: T;
  points: number;
  sameRankPoints: number;
}

export function generateMatchRank<T>(
  match: TTMatch<T>,
  matchRules: TTMatchRules,
  setRules: TTSetRules
): TTMatchRank<T> {
  const { unrankedPlayers, rankedPlayers } = splitRankedAndUnranked<T>(match);
  const playerRanks = rankedPlayers.map(
    (x): TTPlayerRank<T> => {
      return {
        id: x.id,
        player: x.player,
        points: 0,
        sameRankPoints: 0,
      };
    }
  );

  const rankedSets = getRankedSets<T>(match, unrankedPlayers);
  const pointChanges = getPointChanges(rankedSets, matchRules, setRules);
  playerRanks.forEach((r) => {
    pointChanges
      .filter((x) => x.id === r.id)
      .forEach((change) => {
        r.points += change.points;
      });
  });

  const sameRankGroup = playerRanks
    .reduce((pv: { points: number; ids: number[] }[], cv) => {
      const foundGroup = pv.find((x) => x.points == cv.points);
      if (foundGroup) {
        foundGroup.ids.push(cv.id);
        return pv;
      } else {
        const newGroup = { points: cv.points, ids: [cv.id] };
        return [newGroup, ...pv];
      }
    }, [])
    .sort((a, b) => b.points - a.points);

  const ranked: TTPlayerRank<T>[] = [];

  sameRankGroup.forEach((subGroup) => {
    const sameRankPlayers: TTPlayerRank<T>[] = subGroup.ids.map(
      (x) => playerRanks.find((y) => y.id == x) as TTPlayerRank<T>
    );
    const sameRankedSets = getSetsOf<T>(match, subGroup.ids);

    const samePointChanges = getPointChanges(
      sameRankedSets,
      matchRules,
      setRules
    );
    sameRankPlayers.forEach((r) => {
      samePointChanges
        .filter((x) => x.id === r.id)
        .forEach((change) => {
          r.sameRankPoints += change.points;
        });
    });

    sameRankPlayers.sort((a, b) => b.sameRankPoints - a.sameRankPoints);

    ranked.push(...sameRankPlayers);
  });

  return { ranked };
}
function getSetsOf<T>(match: TTMatch<T>, playerIds: number[]): TTMatchSet[] {
  return match
    .getSets()
    .filter(
      (ms) =>
        playerIds.includes(ms.awayPlayerId) &&
        playerIds.includes(ms.homePlayerId)
    );
}

function getRankedSets<T>(
  match: TTMatch<T>,
  unrankedPlayers: { id: number; player: T }[]
) {
  return match
    .getSets()
    .filter(
      (s) =>
        !unrankedPlayers.some(
          (p) => p.id === s.awayPlayerId || p.id === s.homePlayerId
        )
    );
}

function splitRankedAndUnranked<T>(match: TTMatch<T>) {
  const hasTooManyUnplayedMatches: number[] = getPlayersWithTooManyUnplayedMatches<T>(
    match
  );
  const rankedPlayers = match
    .getPlayers()
    .filter((x) => !hasTooManyUnplayedMatches.includes(x.id));

  const unrankedPlayers = match
    .getPlayers()
    .filter((p) => !rankedPlayers.some((rp) => rp.id === p.id));
  return { unrankedPlayers, rankedPlayers };
}

function getPointChanges(
  rankedSets: TTMatchSet[],
  matchRules: TTMatchRules,
  setRules: TTSetRules
) {
  const pointChanges: { id: number; points: number }[] = [];
  rankedSets.forEach((matchSet) => {
    const winner = getSetWinner(matchSet.set, setRules);
    if (matchSet.set.walkover) {
      // In a walkover only the victor gets points
      if (matchSet.set.walkover === "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
        });
      }

      if (matchSet.set.walkover === "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
        });
      }
    } else {
      if (winner == "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
        });
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.defeatPoints,
        });
      }
      if (winner == "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
        });
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.defeatPoints,
        });
      }
    }
  });

  return pointChanges;
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
