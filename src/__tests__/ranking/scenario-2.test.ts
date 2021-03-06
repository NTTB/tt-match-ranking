import { getSetWinner } from "../../helpers";
import { parseSetScore } from "../../parsers";
import { TTMatchRules, TTSetRules } from "../../rules";
import { TTMatch } from "../../tt-match";
import { TTMatchRank, generateMatchRank } from "../../tt-match-rank";

describe("Scenario 2", () => {
  let match: TTMatch<string>;
  let ranking: TTMatchRank<string>;
  const matchRules: TTMatchRules = { defeatPoints: 0, victoryPoints: 1 };
  const setRules: TTSetRules = {
    bestOf: 5,
    gameRules: { scoreDistance: 2, scoreMinimum: 11 },
  };

  beforeAll(() => {
    match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    const p3 = match.addPlayer("C");
    const p4 = match.addPlayer("D");
    const p5 = match.addPlayer("E");
    const p6 = match.addPlayer("F");

    match.addSet(p3, p4, parseSetScore("7-11,8-11,9-11"));
    match.addSet(p2, p5, parseSetScore("5-11,9-11,10-12"));
    match.addSet(p1, p6, parseSetScore("11-5,11-9,11-7"));

    match.addSet(p2, p4, parseSetScore("11-8,11-3,11-9"));
    match.addSet(p3, p6, parseSetScore("11-5,11-7,11-4"));
    match.addSet(p1, p5, parseSetScore("9-11,11-8,12-10,11-8"));

    match.addSet(p5, p6, parseSetScore("9-11,7-11,10-12"));
    match.addSet(p2, p3, parseSetScore("3-11,9-11,7-11"));
    match.addSet(p1, p4, parseSetScore("11-5,11-8,11-3"));

    match.addSet(p2, p6, parseSetScore("11-7,11-8,11-4"));
    match.addSet(p4, p5, parseSetScore("11-9,11-9,11-9"));
    match.addSet(p1, p3, parseSetScore("9-11,7-11,10-12"));

    match.addSet(p4, p6, parseSetScore("8-11,6-11,9-11"));
    match.addSet(p3, p5, parseSetScore("11-9,12-10,12-10"));
    match.addSet(p1, p2, parseSetScore("11-9,11-8,11-6"));

    ranking = generateMatchRank(match, matchRules, setRules);
  });

  test("All sets have a winner", () => {
    match.getSets().forEach((set) => {
      const winner = getSetWinner(set.set, setRules);
      if (winner === undefined) {
        fail(`${set.homePlayerId}-${set.awayPlayerId} has no winner`);
      }
    });
  });

  test.each`
    player | points
    ${"A"} | ${4}
    ${"B"} | ${2}
    ${"C"} | ${4}
    ${"D"} | ${2}
    ${"E"} | ${1}
    ${"F"} | ${2}
  `("Player $player has $points points", ({ player, points }) => {
    expect(ranking.ranked.find((x) => x.player === player)?.points).toBe(
      points
    );
  });

  test.each`
    player | rank
    ${"A"} | ${2}
    ${"B"} | ${3}
    ${"C"} | ${1}
    ${"D"} | ${5}
    ${"E"} | ${6}
    ${"F"} | ${4}
  `("Player $player is ranked $rank", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | sameRankPoints
    ${"A"} | ${0}
    ${"B"} | ${2}
    ${"C"} | ${1}
    ${"D"} | ${0}
    ${"E"} | ${0}
    ${"F"} | ${1}
  `(
    "Player $player has $sameRankPoints sub rank points",
    ({ player, sameRankPoints }) => {
      expect(
        ranking.ranked.find((x) => x.player === player)?.sameRankPoints
      ).toBe(sameRankPoints);
    }
  );
});
