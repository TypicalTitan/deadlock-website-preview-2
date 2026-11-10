// Edit this file to update the site. Nothing else needs to change.

const TOURNAMENT = {
  name: "Deadlock Tournament",
  date: "TBD", // e.g. "Saturday, Dec 6"

  // Four teams of six. Swap in team names and players when you have them.
  teams: [
    { name: "Team 1", players: ["TBD", "TBD", "TBD", "TBD", "TBD", "TBD"] },
    { name: "Team 2", players: ["TBD", "TBD", "TBD", "TBD", "TBD", "TBD"] },
    { name: "Team 3", players: ["TBD", "TBD", "TBD", "TBD", "TBD", "TBD"] },
    { name: "Team 4", players: ["TBD", "TBD", "TBD", "TBD", "TBD", "TBD"] },
  ],

  // The random bracket draw. Use team numbers 1 to 4.
  // Leave as null until the draw happens. Example: semi1: [3, 1], semi2: [4, 2]
  draw: { semi1: null, semi2: null },

  // Games won in each series, in the order the teams are listed.
  // Leave as null until it's played. Example: [2, 1]
  // Winners move on and losers drop to the lower bracket on their own.
  scores: {
    semi1: null,
    semi2: null,
    upperFinal: null,
    lowerRound1: null,
    lowerFinal: null,
    grandFinal: null,
  },
};
