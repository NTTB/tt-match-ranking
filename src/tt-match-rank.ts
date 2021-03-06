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
  sameRankGameRatioEvery: TTRatio;
  sameRankScoreRatioEvery: TTRatio;
}

interface PointChange {
  id: number;
  points: number;
  gameRatio: TTRatio;
  scoreRatio: TTRatio;
}

interface MatchRankStep<T> {
  set: "between" | "every";
  resetChange: (rank: TTPlayerRank<T>) => void;
  applyChange: (rank: TTPlayerRank<T>, mod: PointChange) => void;
  groupAndSortBy: (k: TTPlayerRank<T>) => number;
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
        sameRankScoreRatio: TTRatio.Zero,
        sameRankGameRatioEvery: TTRatio.Zero,
        sameRankScoreRatioEvery: TTRatio.Zero,
      };
    }
  );

  const steps: MatchRankStep<T>[] = [
    // Step 1: Set
    {
      set: "between",
      resetChange: (rank) => (rank.points = 0),
      applyChange: (rank, mod) => (rank.points += mod.points),
      groupAndSortBy: (k) => k.points,
    },
    // Step 2: Set (between themselves)
    {
      set: "between",
      resetChange: (rank) => (rank.sameRankPoints = 0),
      applyChange: (rank, mod) => (rank.sameRankPoints += mod.points),
      groupAndSortBy: (k) => k.sameRankPoints,
    },
    //  Step 3: Game W/L ratio (between themselves)
    {
      set: "between",
      resetChange: (rank) => (rank.sameRankGameRatio = TTRatio.Zero),
      applyChange: (rank, mod) =>
      (rank.sameRankGameRatio = TTRatio.sum(
        rank.sameRankGameRatio,
        mod.gameRatio
      )),
      groupAndSortBy: (k) => k.sameRankGameRatio.ratio,
    },
    //  Step 4: Score W/L Ratio (between themselves)
    {
      set: "between",
      resetChange: (rank) => (rank.sameRankScoreRatio = TTRatio.Zero),
      applyChange: (rank, mod) =>
      (rank.sameRankScoreRatio = TTRatio.sum(
        rank.sameRankScoreRatio,
        mod.scoreRatio
      )),
      groupAndSortBy: (k) => k.sameRankScoreRatio.ratio,
    },
    //  Step 5: Game W/L ratio (including other sets)
    {
      set: "every",
      resetChange: (rank) => (rank.sameRankGameRatioEvery = TTRatio.Zero),
      applyChange: (rank, mod) =>
      (rank.sameRankGameRatioEvery = TTRatio.sum(
        rank.sameRankGameRatioEvery,
        mod.gameRatio
      )),
      groupAndSortBy: (k) => k.sameRankGameRatioEvery.ratio,
    },
    //  Step 6: Score W/L ratio (including other sets)
    {
      set: "every",
      resetChange: (rank) => (rank.sameRankScoreRatioEvery = TTRatio.Zero),
      applyChange: (rank, mod) =>
      (rank.sameRankScoreRatioEvery = TTRatio.sum(
        rank.sameRankScoreRatioEvery,
        mod.scoreRatio
      )),
      groupAndSortBy: (k) => k.sameRankScoreRatioEvery.ratio,
    },
  ];

  const result: TTMatchRank<T> = {
    ranked: [],
  };

  generateMatchRankStep<T>(
    result,
    playerRanks,
    match,
    matchRules,
    setRules,
    steps,
    0
  );

  return result;
}

function generateMatchRankStep<T>(
  result: TTMatchRank<T>,
  remaining: TTPlayerRank<T>[],
  match: TTMatch<T>,
  matchRules: TTMatchRules,
  setRules: TTSetRules,
  steps: MatchRankStep<T>[],
  stepIndex: number
) {
  if (remaining.length <= 1) {
    result.ranked.push(...remaining);
    return;
  }

  if (stepIndex >= steps.length) {
    result.ranked.push(...remaining);
    return;
  }

  const step = steps[stepIndex];
  const sets = filterSets(
    match.getSets(),
    step.set,
    remaining.map((x) => x.id),
    setRules,
  );

  remaining.forEach((rank) => {
    step.resetChange(rank);
  });

  const pointChanges = getPointChanges(sets, matchRules, setRules);

  remaining.forEach((rank) => {
    pointChanges
      .filter((x) => x.id === rank.id)
      .forEach((mod) => step.applyChange(rank, mod));
  });

  remaining.sort((a, b) => step.groupAndSortBy(b) - step.groupAndSortBy(a));

  const grouped = groupBy(
    remaining,
    (x) => step.groupAndSortBy(x),
    (x) => x
  );

  if (grouped.length > 1) {
    // The first group can continue.
    // The other groups, restart at step 2 (index =1)
    for (let i = 0; i < grouped.length; ++i) {
      const group = grouped[i];
      generateMatchRankStep(
        result,
        group.values,
        match,
        matchRules,
        setRules,
        steps,
        1
      );
    }
  } else {
    grouped.forEach((group) => {
      generateMatchRankStep(
        result,
        group.values,
        match,
        matchRules,
        setRules,
        steps,
        stepIndex + 1
      );
    });
  }
}

function filterSets(
  sets: TTMatchSet[],
  filter: "between" | "every",
  playerIds: number[],
  setRules: TTSetRules,
): TTMatchSet[] {
  const completeSets = sets.filter(x => (x.set.walkover || getSetWinner(x.set, setRules)) != undefined);
  return completeSets.filter((ms) => {
    if (filter === "between") {
      return (
        playerIds.includes(ms.awayPlayerId) &&
        playerIds.includes(ms.homePlayerId)
      );
    } else {
      return (
        playerIds.includes(ms.awayPlayerId) ||
        playerIds.includes(ms.homePlayerId)
      );
    }
  });
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
): PointChange[] {
  const pointChanges: PointChange[] = [];
  rankedSets.forEach((matchSet) => {
    const games = matchSet.set.games;
    const gamesWonByHome = games.filter(
      (x) => getGameWinner(x, setRules.gameRules) === "home"
    ).length;
    const gamesWonByAway = games.filter(
      (x) => getGameWinner(x, setRules.gameRules) === "away"
    ).length;
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
          ),
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
