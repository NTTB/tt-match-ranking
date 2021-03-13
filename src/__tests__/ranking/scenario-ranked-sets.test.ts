import { TTMatchRules, TTSetRules } from "../../rules";
import { TTMatch } from "../../tt-match";
import { generateMatchRank } from "../../tt-match-rank";
import { parseSetScore } from "../../parsers";

describe("Scenario: Ranked sets", () => {
  const matchRules: TTMatchRules = { victoryPoints: 2, defeatPoints: 1 };
  const setRules: TTSetRules = {
    bestOf: 5,
    gameRules: { scoreMinimum: 11, scoreDistance: 2 },
  };

  it("should have an empty ranked sets when no sets are played", () => {
    const match = new TTMatch<string>();
    match.addPlayer("A");
    match.addPlayer("B");
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(0);
  });

  it("should not add an incomplete set to rankedSets", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    match.addSet(p1, p2, parseSetScore("11-0")); // We use best of 5, so incomplete
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(0);
  });

  it("should have return all sets that were used in determing the ranking", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    match.addSet(p1, p2, parseSetScore("11-0,11-0,11-0"));
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(1);
  });

  it("should not include sets - 2 players played 1 time", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    match.addSet(p1, p2, parseSetScore("wo:home"));
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(0);
  });

  it("should not include sets - 2 players played 2 times with a single walkover", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    match.addSet(p1, p2, parseSetScore("wo:home"));
    match.addSet(p1, p2, parseSetScore("11-0,11-0,11-0"));
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(0);
  });

  it("should include sets - 2 players played 3 times with a single walkover", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    match.addSet(p1, p2, parseSetScore("wo:home"));
    match.addSet(p1, p2, parseSetScore("11-0,11-0,11-0"));
    match.addSet(p1, p2, parseSetScore("11-0,11-0,11-0"));
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(3);
  });

  it("should not include sets - 2 players played 3 times with a two walkover", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    match.addSet(p1, p2, parseSetScore("wo:home"));
    match.addSet(p1, p2, parseSetScore("11-0,11-0,11-0"));
    match.addSet(p1, p2, parseSetScore("wo:away"));
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(0);
  });

  it("should only include sets of ranked players", () => {
    const match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    const p3 = match.addPlayer("C");
    match.addSet(p1, p2, parseSetScore("wo:away"));
    match.addSet(p1, p3, parseSetScore("wo:away"));
    const s3 = match.addSet(p2, p3, parseSetScore("11-0,11-0,11-0"));
    const result = generateMatchRank(match, matchRules, setRules);
    expect(result.rankedSets).toHaveLength(1);
    expect(result.rankedSets).toEqual([match.getSetById(s3)]);
  });
});
