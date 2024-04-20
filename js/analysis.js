/*
- [ ] I want to understand how important different characters are when considering 1) the show as a whole and 2) a selected season.  
    - [ ] How many episodes do they appear in overall? 
    - [ ] How much do they speak in the show overall? (lines or dialogue, or words could be used here).
- [ ] For the major characters, I want to be able to see which episo
*/

function getTopCharactersOverall(data) {
  const characterLines = [];
  // { character: "Michael Scott", type: "main", lines: 1000, episodes: [{season: 1, episode: 1}, {season: 1, episode: 2}], numEpisodes: 2}
  data.forEach((d) => {
    const characterIndex = characterLines.findIndex(
      (c) => c.character === d.character
    );
    if (characterIndex === -1) {
      characterLines.push({
        character: d.character,
        type: d.charactertype,
        lines: 1,
        episodes: [{ season: d.season, episode: d.episode }],
        numEpisodes: 1,
      });
    } else {
      characterLines[characterIndex].lines += 1;
      // check if the episode is already in the array
      const episodeIndex = characterLines[characterIndex].episodes.findIndex(
        (e) => e.season === d.season && e.episode === d.episode
      );
      if (episodeIndex === -1) {
        characterLines[characterIndex].numEpisodes += 1;
        characterLines[characterIndex].episodes.push({
          season: d.season,
          episode: d.episode,
        });
      }
    }
  });

  // sort by main characters and lines first, then by just lines
  characterLines.sort((a, b) => {
    if (a.type === "main" && b.type !== "main") {
      return -1;
    } else if (a.type !== "main" && b.type === "main") {
      return 1;
    } else {
      return b.lines - a.lines;
    }
  });

  return characterLines;
}
