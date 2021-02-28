import { TTMatchRules, TTSetRules } from "./rules";
import { getSetWinner } from "./tt-set";
import { TTMatch, TTMatchSet } from "./tt-match";
import { groupBy } from "./helpers";
import { getGameWinner } from "./tt-game";
import { TTRatio } from "./tt-ratio";

export interface TTMatchRank<T> {
  ranked: TTPlayerRank<T>[];
}

export interface TTPlayerRank<T> {
  id: number;
  player: T;
  points: number;
  sameRankPoints: number;
  sameRankGameRatio: TTRatio;
  sameRankScoreRatio: TTRatio;
}

export function generateMatchRank<T>(
  match: TTMatch<T>,
  matchRules: TTMatchRules,
  setRules: TTSetRules
): TTMatchRank<T> {
  const { rankedPlayers } = splitRankedAndUnranked<T>(match);
  const playerRanks = rankedPlayers.map(
    (x): TTPlayerRank<T> => {
      return {
        id: x.id,
        player: x.player,
        points: 0,
        sameRankPoints: 0,
        sameRankGameRatio: TTRatio.Zero,
        sameRankScoreRatio: TTRatio.Zero
      };
    }
  );

  const rankedSets = getSetsOf<T>(match, rankedPlayers.map(x => x.id));
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
            r.sameRankGameRatio = TTRatio.sum(r.sameRankGameRatio, change.gameRatio);
          });
      });

      const sortedByGameVictoryRatio = subsubGroup.values.sort((a, b) => {
        return b.sameRankGameRatio.ratio - a.sameRankGameRatio.ratio;
      });

      const sameGameVictoriesQ = groupBy(sortedByGameVictoryRatio,
        x => x.sameRankGameRatio.ratio,
        x => x);

      sameGameVictoriesQ.forEach((sameGameVicotriesQGroup) => {
        if (sameGameVicotriesQGroup.values.length <= 1) {
          ranked.push(...sameGameVicotriesQGroup.values);
          return;
        }

        const sameGameVictoryQSet = getSetsOf<T>(
          match,
          sameGameVicotriesQGroup.values.map((x) => x.id)
        );

        const sameSubVictoryQChanges = getPointChanges(
          sameGameVictoryQSet,
          matchRules,
          setRules
        );

        sameGameVicotriesQGroup.values.forEach((r) => {
          sameSubVictoryQChanges
            .filter((x) => x.id === r.id)
            .forEach((change) => {
              r.sameRankScoreRatio = TTRatio.sum(r.sameRankScoreRatio, change.scoreRatio);
            });
        });

        const sortedByGamePointsRatio = sameGameVicotriesQGroup.values.sort((a, b) => {
          return b.sameRankScoreRatio.ratio - a.sameRankScoreRatio.ratio;
        });

        sortedByGamePointsRatio.forEach((element) => {
          ranked.push(element);
        });
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
  gameRatio: TTRatio;
  scoreRatio: TTRatio;
}

function getPointChanges(
  rankedSets: TTMatchSet[],
  matchRules: TTMatchRules,
  setRules: TTSetRules
): PointChange[] {
  const pointChanges: PointChange[] = [];
  rankedSets.forEach((matchSet) => {
    const games = matchSet.set.games;
    const gamesWonByHome = games.filter((x) => getGameWinner(x, setRules.gameRules) === "home").length
    const gamesWonByAway = games.filter((x) => getGameWinner(x, setRules.gameRules) === "away").length
    const winner = getSetWinner(matchSet.set, setRules);
    if (matchSet.set.walkover) {
      // In a walkover only the victor gets points
      if (matchSet.set.walkover === "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
          gameRatio: TTRatio.Zero,
          scoreRatio: TTRatio.Zero,
        });
      }

      if (matchSet.set.walkover === "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
          gameRatio: TTRatio.Zero,
          scoreRatio: TTRatio.Zero,
        });
      }
    } else {
      if (winner == "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
          gameRatio: new TTRatio(gamesWonByHome, gamesWonByAway),
          scoreRatio: new TTRatio(
            games.reduce((pv, cv) => pv + cv.homeScore, 0),
            games.reduce((pv, cv) => pv + cv.awayScore, 0)
          ),
        });
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.defeatPoints,
          gameRatio: new TTRatio(gamesWonByAway, gamesWonByHome),
          scoreRatio: new TTRatio(
            games.reduce((pv, cv) => pv + cv.awayScore, 0),
            games.reduce((pv, cv) => pv + cv.homeScore, 0)
          ),
        });
      }
      if (winner == "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
          gameRatio: new TTRatio(gamesWonByAway, gamesWonByHome),
          scoreRatio: new TTRatio(
            games.reduce((pv, cv) => pv + cv.awayScore, 0),
            games.reduce((pv, cv) => pv + cv.homeScore, 0)
          ),
        });
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.defeatPoints,
          gameRatio: new TTRatio(gamesWonByHome, gamesWonByAway),
          scoreRatio: new TTRatio(
            games.reduce((pv, cv) => pv + cv.homeScore, 0),
            games.reduce((pv, cv) => pv + cv.awayScore, 0)
          )
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
