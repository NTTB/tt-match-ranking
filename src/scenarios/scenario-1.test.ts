import { TTMatch } from "../tt-match";
import { generateMatchRank, TTMatchRank } from "../tt-match-rank";
import { getSetWinner, parseSetScore } from "../tt-set";

describe("Scenario 1", () => {
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

    match.addSet(p3, p4, parseSetScore("11-7,11-3,11-9"));
    match.addSet(p2, p5, parseSetScore("11-8,11-5,9-11,11-9"));
    match.addSet(p1, p6, parseSetScore("11-4,9-11,7-11,11-8,12-10"));

    match.addSet(p2, p4, parseSetScore("11-8,7-11,11-9,11-5"));
    match.addSet(p3, p6, parseSetScore("11-9,9-11,7-11,12-10,11-8"));
    match.addSet(p1, p5, parseSetScore("11-6,11-8,11-6"));

    match.addSet(p5, p6, parseSetScore("8-11,11-7,11-6,9-11,11-8"));
    match.addSet(p2, p3, parseSetScore("11-8,11-9,11-7"));
    match.addSet(p1, p4, parseSetScore("11-5,11-3,11-6"));

    match.addSet(p2, p6, parseSetScore("11-6,11-5,11-8"));
    match.addSet(p4, p5, parseSetScore("9-11,12-10,11-5,11-8"));
    match.addSet(p1, p3, parseSetScore("11-8,11-7,11-5"));

    match.addSet(p4, p6, parseSetScore("11-7,11-5,10-12,11-9"));
    match.addSet(p3, p5, parseSetScore("11-8,11-8,11-7"));
    match.addSet(p1, p2, parseSetScore("8-11,7-11,11-9,12-10,11-8"));

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
    player | points
    ${"A"} | ${5}
    ${"B"} | ${4}
    ${"C"} | ${3}
    ${"D"} | ${2}
    ${"E"} | ${1}
    ${"F"} | ${0}
  `("Player $player has $points points", ({ player, points }) => {
    expect(ranking.ranked.find((x) => x.player === player)?.points).toBe(
      points
    );
  });

  test.each`
    player | rank
    ${"A"} | ${1}
    ${"B"} | ${2}
    ${"C"} | ${3}
    ${"D"} | ${4}
    ${"E"} | ${5}
    ${"F"} | ${6}
  `("Player $player is ranked $rank", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | sameRankPoints
    ${"A"} | ${0}
    ${"B"} | ${0}
    ${"C"} | ${0}
    ${"D"} | ${0}
    ${"E"} | ${0}
    ${"F"} | ${0}
  `(
    "Player $player has $sameRankPoints sub rank points",
    ({ player, sameRankPoints }) => {
      expect(
        ranking.ranked.find((x) => x.player === player)?.sameRankPoints
      ).toBe(sameRankPoints);
    }
  );
});
