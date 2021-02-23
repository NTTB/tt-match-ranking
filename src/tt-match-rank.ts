import { TTMatchRules, TTSetRules } from "./rules";
import { getSetWinner } from "./tt-set";
import { TTMatch, TTMatchSet } from "./tt-match";
import { groupBy } from "./helpers";
import { getGameWinner } from "./tt-game";

export interface TTMatchRank<T> {
  ranked: TTPlayerRank<T>[];
}

export interface TTPlayerRank<T> {
  id: number;
  player: T;
  points: number;
  sameRankPoints: number;
  sameRankGameVictories: number;
  sameRankGameDefeats: number;
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
        sameRankGameVictories: 0,
        sameRankGameDefeats: 0,
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

  const sameRankGroup = groupBy(
    playerRanks,
    (x) => x.points,
    (x) => x.id
  ).sort((a, b) => b.key - a.key);

  const ranked: TTPlayerRank<T>[] = [];

  sameRankGroup.forEach((subGroup) => {
    const sameRankPlayers: TTPlayerRank<T>[] = subGroup.values.map(
      (x) => playerRanks.find((y) => y.id == x) as TTPlayerRank<T>
    );
    const sameRankedSets = getSetsOf<T>(match, subGroup.values);

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
    const sameSubRankPlayers = groupBy(
      sameRankPlayers,
      (x) => x.sameRankPoints,
      (x) => x
    ).sort((a, b) => b.key - a.key);

    sameSubRankPlayers.forEach((subsubGroup) => {
      if (subsubGroup.values.length <= 1) {
        ranked.push(...subsubGroup.values);
        return;
      }

      const sameSubRankedSets = getSetsOf<T>(
        match,
        subsubGroup.values.map((x) => x.id)
      );

      const sameSubPointChanges = getPointChanges(
        sameSubRankedSets,
        matchRules,
        setRules
      );

      subsubGroup.values.forEach((r) => {
        sameSubPointChanges
          .filter((x) => x.id === r.id)
          .forEach((change) => {
            r.sameRankGameVictories += change.gameVictories;
            r.sameRankGameDefeats += change.gameDefeats;
          });
      });

      const sortedByPoints = subsubGroup.values.sort((a, b) => {
        if (
          a.sameRankGameDefeats === 0 &&
          a.sameRankGameVictories === 0 &&
          b.sameRankGameDefeats === 0 &&
          b.sameRankGameVictories === 0
        ) {
          return 0;
        }
        if (a.sameRankGameDefeats === 0 && b.sameRankGameDefeats === 0) {
          throw new Error(
            "Equal ranked players without a defeat can't be sorted"
          );
        }
        const aq = a.sameRankGameVictories / a.sameRankGameDefeats;
        const bq = b.sameRankGameVictories / b.sameRankGameDefeats;
        return bq - aq;
      });

      sortedByPoints.forEach((element) => {
        ranked.push(element);
      });
    });
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

interface PointChange {
  id: number;
  points: number;
  gameVictories: number;
  gameDefeats: number;
}

function getPointChanges(
  rankedSets: TTMatchSet[],
  matchRules: TTMatchRules,
  setRules: TTSetRules
): PointChange[] {
  const pointChanges: PointChange[] = [];
  rankedSets.forEach((matchSet) => {
    const winner = getSetWinner(matchSet.set, setRules);
    if (matchSet.set.walkover) {
      // In a walkover only the victor gets points
      if (matchSet.set.walkover === "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
          gameVictories: 0, // Doesn't apply
          gameDefeats: 0, // Doesn't apply
        });
      }

      if (matchSet.set.walkover === "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
          gameVictories: 0, // Doesn't apply
          gameDefeats: 0, // Doesn't apply
        });
      }
    } else {
      if (winner == "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
          gameVictories: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "home"
          ).length,
          gameDefeats: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "away"
          ).length,
        });
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.defeatPoints,
          gameVictories: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "away"
          ).length,
          gameDefeats: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "home"
          ).length,
        });
      }
      if (winner == "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
          gameVictories: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "away"
          ).length,
          gameDefeats: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "home"
          ).length,
        });
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.defeatPoints,
          gameVictories: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "home"
          ).length,
          gameDefeats: matchSet.set.games.filter(
            (x) => getGameWinner(x, setRules.gameRules) === "away"
          ).length,
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
