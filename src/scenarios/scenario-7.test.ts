import { TTMatch } from "../tt-match";
import { generateMatchRank, TTMatchRank } from "../tt-match-rank";
import { getSetWinner, parseSetScore } from "../tt-set";

describe("Scenario 7", () => {
  let match: TTMatch<string>;
  let ranking: TTMatchRank<string>;
  beforeAll(() => {
    match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    const p3 = match.addPlayer("C");
    const p4 = match.addPlayer("F");
    const p5 = match.addPlayer("E");
    const p6 = match.addPlayer("D");

    match.addSet(p3, p4, parseSetScore("11-8,11-9,11-13,11-5"));
    match.addSet(p2, p5, parseSetScore("11-8,13-11,11-9"));
    match.addSet(p1, p6, parseSetScore("11-5,7-11,4-11,11-9,11-6"));

    match.addSet(p2, p4, parseSetScore("11-7,11-9,6-11,9-11,13-11"));
    match.addSet(p3, p6, parseSetScore("11-7,5-11,11-9,11-8"));
    match.addSet(p1, p5, parseSetScore("11-7,15-13,11-6"));

    match.addSet(p5, p6, parseSetScore("7-11,10-12,6-11"));
    match.addSet(p2, p3, parseSetScore("7-11,14-12,11-5,10-12,11-7"));
    match.addSet(p1, p4, parseSetScore("11-6,11-9,11-8"));

    match.addSet(p2, p6, parseSetScore("13-11,11-7,11-2"));
    match.addSet(p4, p5, parseSetScore("4-11,7-11,8-11"));
    match.addSet(p1, p3, parseSetScore("11-8,13-11,15-17,4-11,10-12"));

    match.addSet(p4, p6, parseSetScore("7-11,12-10,6-11,11-13"));
    match.addSet(p3, p5, parseSetScore("11-4,11-9,13-11"));
    match.addSet(p1, p2, parseSetScore("9-11,14-12,9-11,11-5,13-11"));

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
    ${"A"} | ${1}
    ${"B"} | ${2}
    ${"C"} | ${3}
    ${"D"} | ${4}
    ${"E"} | ${5}
    ${"F"} | ${6}
  `("Rank $rank is player $player", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | points
    ${"A"} | ${4}
    ${"B"} | ${4}
    ${"C"} | ${4}
    ${"D"} | ${2}
    ${"E"} | ${1}
    ${"F"} | ${0}
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
    ${"D"} | ${0}
    ${"E"} | ${0}
    ${"F"} | ${0}
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
    ${"B"} | ${5} | ${5}
    ${"C"} | ${5} | ${5}
    ${"D"} | ${0} | ${0}
    ${"E"} | ${0} | ${0}
    ${"F"} | ${0} | ${0}
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
    player | won    | lost
    ${"A"} | ${109} | ${109}
    ${"B"} | ${103} | ${103}
    ${"C"} | ${106} | ${106}
    ${"D"} | ${0}   | ${0}
    ${"E"} | ${0}   | ${0}
    ${"F"} | ${0}   | ${0}
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
    ${"A"} | ${14} | ${7}
    ${"B"} | ${14} | ${7}
    ${"C"} | ${14} | ${7}
    ${"D"} | ${0}  | ${0}
    ${"E"} | ${0}  | ${0}
    ${"F"} | ${0}  | ${0}
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
    ${"A"} | ${223} | ${200}
    ${"B"} | ${223} | ${200}
    ${"C"} | ${223} | ${200}
    ${"D"} | ${0}   | ${0}
    ${"E"} | ${0}   | ${0}
    ${"F"} | ${0}   | ${0}
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
