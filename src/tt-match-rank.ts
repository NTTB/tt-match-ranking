import { WinLoseRatio, groupBy, getSetWinner, getGameWinner } from "./helpers";
import { TTMatchRules, TTSetRules } from "./rules";
import { TTMatch, TTMatchSet } from "./tt-match";

/**
 * The ranking of a match.
 * @typeParam T The type that describes each player
 */
export interface TTMatchRank<T> {
  /** The players sorted by rank */
  ranked: TTPlayerRank<T>[];

  /**
   * The sets that are used in the calculating the ranking.
   * Only sets of ranked players are included.
   */
  rankedSets: TTMatchSet[];
}

/**
 * The rank reuslt of a player
 */
export interface TTPlayerRank<T> {
  /** The id of the player when it was added to the match */
  id: number;

  /** The data that was used to describe the player when added to the match */
  player: T;

  /** The number of points gained from a match */
  points: number;

  /** With which playerIds the player has to share his rank and that require a coin flip. */
  sharedWith: number[];

  /**
   * @internal Used for internal calculations
   * @deprecated Likely to be moved in future versions as it exposes internal calculation state.
   * Describes the points the player has when only looking at games of players who share the same points count.
   */
  sameRankPoints: number;

  /**
   * @internal Used for internal calculations
   * @deprecated Likely to be moved in future versions as it exposes internal calculation state.
   * The games the player has won/lost the same sameRankPoints among the players with the
   * - same sameRankPoints
   */
  sameRankGameRatio: WinLoseRatio;

  /**
   * @internal Used for internal calculations
   * @deprecated Likely to be moved in future versions as it exposes internal calculation state.
   * The score the player has won/lost among the players with the
   * - same sameRankPoints
   * - same sameRankGameRatio
   */
  sameRankScoreRatio: WinLoseRatio;

  /**
   * @internal Used for internal calculations
   * @deprecated Likely to be moved in future versions as it exposes internal calculation state.
   * The games the player has won/lost among all played matches when
   * - same sameRankPoints
   * - same sameRankGameRatio
   * - same sameRankScoreRatio
   */
  sameRankGameRatioEvery: WinLoseRatio;

  /**
   * @internal Used for internal calculations
   * @deprecated Likely to be moved in future versions as it exposes internal calculation state.
   * The scores the player has won/lost among all played matches when
   * - same sameRankPoints
   * - same sameRankGameRatio
   * - same sameRankScoreRatio
   * - same sameRankGameRatioEvery
   */
  sameRankScoreRatioEvery: WinLoseRatio;
}

interface PointChange {
  id: number;
  points: number;
  gameRatio: WinLoseRatio;
  scoreRatio: WinLoseRatio;
}

interface MatchRankStep<T> {
  set: "between" | "every";
  resetChange: (rank: TTPlayerRank<T>) => void;
  applyChange: (rank: TTPlayerRank<T>, mod: PointChange) => void;
  groupAndSortBy: (k: TTPlayerRank<T>) => number;
}

/**
 * Generates the ranking.
 * @param match The match of which the players need to be ranked
 * @param matchRules The rules of the match
 * @param setRules The rules for every set
 * @returns The ranking sorted according to the table tennis rules.
 */
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
        sameRankGameRatio: WinLoseRatio.Zero,
        sameRankScoreRatio: WinLoseRatio.Zero,
        sameRankGameRatioEvery: WinLoseRatio.Zero,
        sameRankScoreRatioEvery: WinLoseRatio.Zero,
        sharedWith: [],
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
      resetChange: (rank) => (rank.sameRankGameRatio = WinLoseRatio.Zero),
      applyChange: (rank, mod) =>
        (rank.sameRankGameRatio = WinLoseRatio.sum(
          rank.sameRankGameRatio,
          mod.gameRatio
        )),
      groupAndSortBy: (k) => k.sameRankGameRatio.ratio,
    },
    //  Step 4: Score W/L Ratio (between themselves)
    {
      set: "between",
      resetChange: (rank) => (rank.sameRankScoreRatio = WinLoseRatio.Zero),
      applyChange: (rank, mod) =>
        (rank.sameRankScoreRatio = WinLoseRatio.sum(
          rank.sameRankScoreRatio,
          mod.scoreRatio
        )),
      groupAndSortBy: (k) => k.sameRankScoreRatio.ratio,
    },
    //  Step 5: Game W/L ratio (including other sets)
    {
      set: "every",
      resetChange: (rank) => (rank.sameRankGameRatioEvery = WinLoseRatio.Zero),
      applyChange: (rank, mod) =>
        (rank.sameRankGameRatioEvery = WinLoseRatio.sum(
          rank.sameRankGameRatioEvery,
          mod.gameRatio
        )),
      groupAndSortBy: (k) => k.sameRankGameRatioEvery.ratio,
    },
    //  Step 6: Score W/L ratio (including other sets)
    {
      set: "every",
      resetChange: (rank) => (rank.sameRankScoreRatioEvery = WinLoseRatio.Zero),
      applyChange: (rank, mod) =>
        (rank.sameRankScoreRatioEvery = WinLoseRatio.sum(
          rank.sameRankScoreRatioEvery,
          mod.scoreRatio
        )),
      groupAndSortBy: (k) => k.sameRankScoreRatioEvery.ratio,
    },
  ];

  const result: TTMatchRank<T> = {
    ranked: [],
    rankedSets: filterSets(
      match.getSets(),
      "between",
      rankedPlayers.map((x) => x.id),
      setRules
    ),
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
    // No more steps, players share the same rank.
    remaining.forEach((x) => {
      const otherPlayerIds = remaining
        .map((y) => y.id)
        .filter((y) => y !== x.id);
      x.sharedWith.push(...otherPlayerIds);
    });

    result.ranked.push(...remaining);
    return;
  }

  const step = steps[stepIndex];
  const sets = filterSets(
    match.getSets(),
    step.set,
    remaining.map((x) => x.id),
    setRules
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
  setRules: TTSetRules
): TTMatchSet[] {
  const completeSets = sets.filter(
    (x) => (x.set.walkover || getSetWinner(x.set, setRules)) != undefined
  );
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
  // Only players that caused a walk over can be removed from the match.
  const canBeStrikedPlayers: number[] = [];

  match.getSets().forEach((x) => {
    if (
      x.set.walkover == "home" &&
      !canBeStrikedPlayers.includes(x.awayPlayerId)
    ) {
      canBeStrikedPlayers.push(x.awayPlayerId);
    }
    if (
      x.set.walkover == "away" &&
      !canBeStrikedPlayers.includes(x.homePlayerId)
    ) {
      canBeStrikedPlayers.push(x.homePlayerId);
    }
  });
  const strikePlayers: number[] = [];

  canBeStrikedPlayers.forEach((pId) => {
    const setsWithPlayer = match
      .getSets()
      .filter((x) => x.homePlayerId == pId || x.awayPlayerId == pId);

    const playedSets = setsWithPlayer.filter(
      (x) => x.set.walkover === undefined
    ).length;

    const notEnoughPlayedSets = playedSets <= setsWithPlayer.length / 2;
    if (notEnoughPlayedSets) {
      strikePlayers.push(pId);
    }
  });

  const rankedPlayers = match
    .getPlayers()
    .filter((p) => !strikePlayers.includes(p.id));

  const unrankedPlayers = match
    .getPlayers()
    .filter((p) => strikePlayers.includes(p.id));

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
          gameRatio: WinLoseRatio.Zero,
          scoreRatio: WinLoseRatio.Zero,
        });
      }

      if (matchSet.set.walkover === "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
          gameRatio: WinLoseRatio.Zero,
          scoreRatio: WinLoseRatio.Zero,
        });
      }
    } else {
      if (winner == "home") {
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.victoryPoints,
          gameRatio: new WinLoseRatio(gamesWonByHome, gamesWonByAway),
          scoreRatio: new WinLoseRatio(
            games.reduce((pv, cv) => pv + cv.homeScore, 0),
            games.reduce((pv, cv) => pv + cv.awayScore, 0)
          ),
        });
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.defeatPoints,
          gameRatio: new WinLoseRatio(gamesWonByAway, gamesWonByHome),
          scoreRatio: new WinLoseRatio(
            games.reduce((pv, cv) => pv + cv.awayScore, 0),
            games.reduce((pv, cv) => pv + cv.homeScore, 0)
          ),
        });
      }
      if (winner == "away") {
        pointChanges.push({
          id: matchSet.awayPlayerId,
          points: matchRules.victoryPoints,
          gameRatio: new WinLoseRatio(gamesWonByAway, gamesWonByHome),
          scoreRatio: new WinLoseRatio(
            games.reduce((pv, cv) => pv + cv.awayScore, 0),
            games.reduce((pv, cv) => pv + cv.homeScore, 0)
          ),
        });
        pointChanges.push({
          id: matchSet.homePlayerId,
          points: matchRules.defeatPoints,
          gameRatio: new WinLoseRatio(gamesWonByHome, gamesWonByAway),
          scoreRatio: new WinLoseRatio(
            games.reduce((pv, cv) => pv + cv.homeScore, 0),
            games.reduce((pv, cv) => pv + cv.awayScore, 0)
          ),
        });
      }
    }
  });

  return pointChanges;
}
