import { sortRanking } from './ranking';

it("should work with an empty array", () => {
    // Arrange
    const input = [];
    // Act
    const result = sortRanking(input);

    expect(result.length).toBe(0);
});