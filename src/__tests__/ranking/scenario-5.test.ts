import { getSetWinner } from "../../helpers";
import { parseSetScore } from "../../parsers";
import { TTMatchRules, TTSetRules } from "../../rules";
import { TTMatch } from "../../tt-match";
import { TTMatchRank, generateMatchRank } from "../../tt-match-rank";

describe("Scenario 5", () => {
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

    match.addSet(p3, p4, parseSetScore("11-7,13-11,9-11,11-8"));
    match.addSet(p2, p5, parseSetScore("6-11,10-12,5-11"));
    match.addSet(p1, p6, parseSetScore("8-11,11-9,7-11,8-11"));

    match.addSet(p2, p4, parseSetScore("6-11,5-11,7-11"));
    match.addSet(p3, p6, parseSetScore("11-2,3-11,11-7,11-8"));
    match.addSet(p1, p5, parseSetScore("7-11,6-11,8-11"));

    match.addSet(p5, p6, parseSetScore("7-11,1-11,7-11"));
    match.addSet(p2, p3, parseSetScore("9-11,8-11,10-12"));
    match.addSet(p1, p4, parseSetScore("6-11,12-10,13-11,8-11,11-9"));

    match.addSet(p2, p6, parseSetScore("11-5,11-9,11-2"));
    match.addSet(p4, p5, parseSetScore("8-11,6-11,7-11"));
    match.addSet(p1, p3, parseSetScore("10-12,11-8,11-6,11-9"));

    match.addSet(p4, p6, parseSetScore("6-11,11-9,8-11,10-12"));
    match.addSet(p3, p5, parseSetScore("6-11,11-13,10-12"));
    match.addSet(p1, p2, parseSetScore("11-3,11-6,9-11,11-9"));

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
    player | rank
    ${"E"} | ${1}
    ${"C"} | ${2}
    ${"F"} | ${3}
    ${"A"} | ${4}
    ${"D"} | ${5}
    ${"B"} | ${6}
  `("Rank $rank is player $player", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | points
    ${"E"} | ${4}
    ${"C"} | ${3}
    ${"F"} | ${3}
    ${"A"} | ${3}
    ${"D"} | ${1}
    ${"B"} | ${1}
  `("Player $player has $points points", ({ player, points }) => {
    expect(ranking.ranked.find((x) => x.player === player)?.points).toBe(
      points
    );
  });

  test.each`
    player | sameRankPoints
    ${"E"} | ${0}
    ${"C"} | ${1}
    ${"F"} | ${0}
    ${"A"} | ${1}
    ${"D"} | ${1}
    ${"B"} | ${0}
  `(
    "Player $player has $sameRankPoints sub rank points",
    ({ player, sameRankPoints }) => {
      const rank = ranking.ranked.find((x) => x.player === player);
      expect(rank?.sameRankPoints).toBe(sameRankPoints);
    }
  );

  describe.each`
    player | sameRankGameVictories | sameRankGameDefeats
    ${"E"} | ${0}                  | ${0}
    ${"C"} | ${4}                  | ${4}
    ${"F"} | ${4}                  | ${4}
    ${"A"} | ${4}                  | ${4}
    ${"D"} | ${0}                  | ${0}
    ${"B"} | ${0}                  | ${0}
  `(
    "Player $player has $sameRankGameVictories-$sameRankGameDefeats sameRank game victories/defeats",
    ({ player, sameRankGameVictories, sameRankGameDefeats }) => {
      test(`${player} has ${sameRankGameVictories} same rank victories`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatio.won).toBe(sameRankGameVictories);
      });

      test(`${player} has ${sameRankGameDefeats} same rank defeats`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatio.lost).toBe(sameRankGameDefeats);
      });
    }
  );

  describe.each`
    player | sameRankGamePointsWon | sameRankGamePointsLost
    ${"E"} | ${0}                  | ${0}
    ${"C"} | ${71}                 | ${71}
    ${"F"} | ${70}                 | ${70}
    ${"A"} | ${77}                 | ${77}
    ${"D"} | ${0}                  | ${0}
    ${"B"} | ${0}                  | ${0}
  `(
    "Player $player has $sameRankGamePointsWon-$sameRankGamePointsLost sameRank game points won/lost",
    ({ player, sameRankGamePointsWon, sameRankGamePointsLost }) => {
      test(`${player} has ${sameRankGamePointsWon} same rank points won`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatio.won).toBe(sameRankGamePointsWon);
      });

      test(`${player} has ${sameRankGamePointsLost} same rank points lost`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatio.lost).toBe(sameRankGamePointsLost);
      });
    }
  );

  describe.each`
    player | sameRankGameVictoriesAll | sameRankGameDefeatsAll
    ${"E"} | ${0}                     | ${0}
    ${"C"} | ${10}                    | ${8}
    ${"F"} | ${10}                    | ${8}
    ${"A"} | ${10}                    | ${10}
    ${"D"} | ${0}                     | ${0}
    ${"B"} | ${0}                     | ${0}
  `(
    "Player $player has $sameRankGameVictoriesAll-$sameRankGameDefeatsAll sameRank game points won/lost (ALL)",
    ({ player, sameRankGameVictoriesAll, sameRankGameDefeatsAll }) => {
      test(`${player} has ${sameRankGameVictoriesAll} same rank victories ALL`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatioEvery.won).toBe(sameRankGameVictoriesAll);
      });

      test(`${player} has ${sameRankGameDefeatsAll} same rank defeats ALL`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatioEvery.lost).toBe(sameRankGameDefeatsAll);
      });
    }
  );
});
