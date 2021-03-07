# Table Tennis Match Ranking

A library that calculates the ranking of match (often a tournament) in table tennis.

It follows the official NTTB rules for tournaments.

- Supports using your own datatypes to define your players
- Supports various ways of scoring for both game, set and match
- Supports walkovers (winning because the opponent refuses to player)
- Supports incomplete games and sets

## Installing

```shell
npm i @nttb/tt-match-ranking
```

## Documentation

You can find the documentation here: <https://nttb.github.io/tt-match-ranking/>

## FAQ

- **Q:** The top-most data type is `TTMatch` shouldn't that be called a competiton or tournament?  
  **A:** No, but we agree it's confusing. The naming convention is based on the "game, set and match". However many table tennis players talk about "winning a set" as if it were "winning a game".
- **Q:** Why can I only add players/sets but not update them?  
  **A:** Although the library looks like it is intended to be used manage a match, the only goal is to calculate the ranking. We recommend creating your own data types for storing and managing and then use this library to calculate the ranking. _(We tried to create an all-in-one solution but failed as calculating ranking is quite complex)_
- **Q:** How well tested is this library?  
  **A:** The library was created through test driven development and has a 100% test coverage, meaning that all functionality was written because an earlier test case demanded it. We are certain that all official scenarios are tested and we even added a few tests for unofficial edge cases such as when games or sets aren't completed. However like every piece of code the "absence of proof" is not "proof of absence".
- **Q:** Can I use the library in javascript instead of typescript?  
  **A:** Yes, the library is compiled to javascript from typescript without any dependencies. The example only uses typescript as it better displays the functionality. 

## Example

```ts
import { 
  TTMatch,              // The type that contains all the match data
  parseSetScore,        // An easy to use function for adding sets
  generateMatchRank     // The function that generates the ranking
} from "@nttb/tt-match-ranking";

////////////////////////////////////////////////////////////////
// 0. You can create your own player-information (or just use a string).
interface MyPlayerType {
  name: string;
  club: string;
}

////////////////////////////////////////////////////////////////
// 1. Define the match and set rules
const matchRules = {
  victoryPoints: 2, // Players get 2 points when they are the winner
  defeatPoints: 1   // Players get 1 points when they play and lose...
                    // ... so that players that refuse to play are at a bigger disadvantage. 
};

const setRules = {
  bestOf: 5,           // A set is won when a player has 3 out of 5 games. 

  gameRules: {         // A game is won when a player...
    scoreMinimum: 11,  // - ... has at least 11 points
    scoreDistance: 2,  // - ... has at least 2 points advantage 
  }
};

////////////////////////////////////////////////////////////////
// 2. Create the match/tournament.
const match = new TTMatch<MyPlayerType>();

////////////////////////////////////////////////////////////////
// 3. Add the players that are participating.
const playerA = match.addPlayer({ name: "Player A", club: "my-club" });
const playerB = match.addPlayer({ name: "Player B", club: "my-club" });
const playerC = match.addPlayer({ name: "Player C", club: "my-club" });
const playerD = match.addPlayer({ name: "Player D", club: "my-club" });
const playerE = match.addPlayer({ name: "Player E", club: "my-club" });
const playerF = match.addPlayer({ name: "Player F", club: "my-club" });

////////////////////////////////////////////////////////////////
// 4. Add the played sets
// A vs B -- Player A loses in 3 games
match.addSet(playerA, playerB, parseSetScore("0-11,0-11,0-11"));
// A vs C -- Player A wins in 4 games
match.addSet(playerA, playerC, parseSetScore("0-11,11-0,11-0,11-0"));
// A vs D -- Player A loses in 5 games.
match.addSet(playerA, playerD, parseSetScore("0-11,11-0,0-11,11-0,0-11"));
// A vs E -- Player A wins because player E refuses to play
match.addSet(playerA, playerE, parseSetScore("wo:home"));
// A vs F -- Unknown result, as the set has no clear winner.
match.addSet(playerA, playerF, parseSetScore("0-11"));

////////////////////////////////////////////////////////////////
// 5. Calculate the ranking
const ranking = generateMatchRank(match, matchRules, setRules);

////////////////////////////////////////////////////////////////
// X. Display the ranking
ranking.ranked.forEach((rank, i) => {
  const pos = i + 1;
  console.log(`${pos}. ${rank.player.name}`)
})
```
