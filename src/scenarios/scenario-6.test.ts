import { TTMatch } from "../tt-match";
import { generateMatchRank, TTMatchRank } from "../tt-match-rank";
import { getSetWinner, parseSetScore } from "../tt-set";

describe("Scenario 6", () => {
  let match: TTMatch<string>;
  let ranking: TTMatchRank<string>;
  beforeAll(() => {
    match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    const p3 = match.addPlayer("C");
    const p4 = match.addPlayer("D");
    const p5 = match.addPlayer("E");
    const p6 = match.addPlayer("F");

    match.addSet(p3, p4, parseSetScore("11-5,11-7,10-12,11-2"));
    match.addSet(p2, p5, parseSetScore("9-11,8-11,11-8,9-11"));
    match.addSet(p1, p6, parseSetScore("11-8,10-12,11-9,9-11,11-5"));

    match.addSet(p2, p4, parseSetScore("6-11,5-11,7-11"));
    match.addSet(p3, p6, parseSetScore("3-11,11-4,11-8,7-11,8-11"));
    match.addSet(p1, p5, parseSetScore("7-11,11-6,8-11,11-9,4-11"));

    match.addSet(p5, p6, parseSetScore("7-11,12-10,9-11,13-11,6-11"));
    match.addSet(p2, p3, parseSetScore("11-5,6-11,3-11,11-7,11-9"));
    match.addSet(p1, p4, parseSetScore("9-11,11-7,12-10,7-11,11-4"));

    match.addSet(p2, p6, parseSetScore("11-8,11-8,11-8"));
    match.addSet(p4, p5, parseSetScore("11-6,11-9,11-8"));
    match.addSet(p1, p3, parseSetScore("13-11,7-11,10-12,7-11"));

    match.addSet(p4, p6, parseSetScore("7-11,12-10,6-11,11-13"));
    match.addSet(p3, p5, parseSetScore("4-11,11-13,12-10,12-10,7-11"));
    match.addSet(p1, p2, parseSetScore("11-9,11-3,6-11,7-11,12-10"));

    ranking = generateMatchRank(
      match,
      { defeatPoints: 0, victoryPoints: 1 },
      { bestOf: 5, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
    );
  });

  test("All sets have a winner", () => {
    match.getSets().forEach((set) => {
      const winner = getSetWinner(set.set, {
        bestOf: 5,
        gameRules: { scoreDistance: 2, scoreMinimum: 11 },
      });
      if (winner === undefined) {
        fail(`${set.homePlayerId}-${set.awayPlayerId} has no winner`);
      }
    });
  });

  test.each`
    player | rank
    ${"A"} | ${3}
    ${"B"} | ${6}
    ${"C"} | ${5}
    ${"D"} | ${4}
    ${"E"} | ${2}
    ${"F"} | ${1}
  `("Rank $rank is player $player", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | points
    ${"A"} | ${3}
    ${"B"} | ${2}
    ${"C"} | ${2}
    ${"D"} | ${2}
    ${"E"} | ${3}
    ${"F"} | ${3}
  `("Player $player has $points points", ({ player, points }) => {
    expect(ranking.ranked.find((x) => x.player === player)?.points).toBe(
      points
    );
  });

  test.each`
    player | sameRankPoints
    ${"A"} | ${1}
    ${"B"} | ${1}
    ${"C"} | ${1}
    ${"D"} | ${1}
    ${"E"} | ${1}
    ${"F"} | ${1}
  `(
    "Player $player has $sameRankPoints same rank points",
    ({ player, sameRankPoints }) => {
      const rank = ranking.ranked.find((x) => x.player === player);
      expect(rank?.sameRankPoints).toBe(sameRankPoints);
    }
  );

  describe.each`
    player | won  | lost
    ${"A"} | ${5} | ${5}
    ${"B"} | ${3} | ${5}
    ${"C"} | ${5} | ${4}
    ${"D"} | ${4} | ${3}
    ${"E"} | ${5} | ${5}
    ${"F"} | ${5} | ${5}
  `(
    "Player $player has $won-$lost same rank game won/lost",
    ({ player, won, lost }) => {
      test(`${player} has ${won} same rank won`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatio.won).toBe(won);
      });

      test(`${player} has ${lost} same rank lost`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatio.lost).toBe(lost);
      });
    }
  );

  describe.each`
    player | won   | lost
    ${"A"} | ${93} | ${93}
    ${"B"} | ${0}  | ${0}
    ${"C"} | ${0}  | ${0}
    ${"D"} | ${0}  | ${0}
    ${"E"} | ${95} | ${95}
    ${"F"} | ${99} | ${99}
  `(
    "Player $player has $won-$lost same rank score won/lost",
    ({ player, won, lost }) => {
      test(`${player} has ${won} same rank score won`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatio.won).toBe(won);
      });

      test(`${player} has ${lost} same rank score lost`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatio.lost).toBe(lost);
      });
    }
  );

  describe.each`
    player | won   | lost
    ${"A"} | ${12} | ${12}
    ${"B"} | ${0}  | ${0}
    ${"C"} | ${0}  | ${0}
    ${"D"} | ${0}  | ${0}
    ${"E"} | ${11} | ${11}
    ${"F"} | ${11} | ${11}
  `(
    "Player $player has $won-$lost sameRank game won/lost (ALL)",
    ({ player, won, lost }) => {
      test(`${player} has ${won} same rank game won ALL matches`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatioEvery.won).toBe(won);
      });

      test(`${player} has ${lost} same rank lost ALL matches`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatioEvery.lost).toBe(lost);
      });
    }
  );

  describe.each`
    player | won    | lost
    ${"A"} | ${227} | ${225}
    ${"B"} | ${0}   | ${0}
    ${"C"} | ${0}   | ${0}
    ${"D"} | ${0}   | ${0}
    ${"E"} | ${214} | ${211}
    ${"F"} | ${213} | ${208}
  `(
    "Player $player has $won-$lost sameRank game score won/lost (ALL)",
    ({ player, won, lost }) => {
      test(`${player} has ${won} same rank score won ALL matches`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatioEvery.won).toBe(won);
      });

      test(`${player} has ${lost} same rank score lost  ALL matches`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatioEvery.lost).toBe(lost);
      });
    }
  );
});
