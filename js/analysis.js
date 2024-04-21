/*
- [ ] I want to understand how important different characters are when considering 1) the show as a whole and 2) a selected season.  
    - [ ] How many episodes do they appear in overall? 
    - [ ] How much do they speak in the show overall? (lines or dialogue, or words could be used here).
- [ ] For the major characters, I want to be able to see which episo
*/

function getTopCharactersOverall(data) {
  const characterLines = [];
  /*
    {
        character: "Michael Scott",
        type: "main",
        lines: 1000,
        episodes: [
            {season: 1, episode: 1},
            {season: 1, episode: 2}
        ],
        seasons: [1, 2],
        numEpisodes: 2,
    }
  */
  data.forEach((d) => {
    const characterIndex = characterLines.findIndex(
      (c) => c.character === d.character
    );
    if (characterIndex === -1) {
      characterLines.push({
        character: d.character,
        charactername: d.charactername,
        type: d.charactertype,
        lines: 1,
        episodes: [{ season: d.season, episode: d.episode }],
        numEpisodes: 1,
        seasons: [d.season],
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
      // check if the season is already in the array
      const seasonIndex = characterLines[characterIndex].seasons.findIndex(
        (s) => s === d.season
      );
      if (seasonIndex === -1) {
        characterLines[characterIndex].seasons.push(d.season);
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

  // condense the seasons array, account for gaps
  // for example, if the seasons array is [1, 2, 3, 5, 6, 7]
  // it should return "1-3, 5-7"
  // if the seasons array is [1, 2, 3, 4, 5, 6, 7]
  // it should return "1-7"

  characterLines.forEach((c) => {
    c.seasons.sort((a, b) => a - b);
    const seasonRanges = [];
    let start = c.seasons[0];
    let end = c.seasons[0];
    for (let i = 1; i < c.seasons.length; i++) {
      if (c.seasons[i] - end === 1) {
        end = c.seasons[i];
      } else {
        if (start === end) {
          seasonRanges.push(start);
        } else {
          seasonRanges.push(`${start}-${end}`);
        }
        start = c.seasons[i];
        end = c.seasons[i];
      }
    }
    if (start === end) {
      seasonRanges.push(start);
    } else {
      seasonRanges.push(`${start}-${end}`);
    }
    c.seasons = seasonRanges;
  });

  return characterLines;
}
