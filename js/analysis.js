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
      let query = d.charactername.replace(" ", "+");
      let link = `https://frasier.fandom.com/wiki/Special:Search?query=${query}`;
      characterLines.push({
        character: d.character,
        charactername: d.charactername,
        charactertype: d.charactertype,
        lines: 1,
        episodes: [{ season: d.season, episode: d.episode }],
        numEpisodes: 1,
        seasons: [d.season],
        link: link,
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

/**
 * This function returns the number of lines spoken by each character in each episode.
 * @param {Array} data - the processed data
 * @param {Array} onlyCharacters - an array of character names to include in the analysis. If null, include all characters
 * @returns {Array} - an array of objects with the following structure:
 * [
 *  {
 *    characters: [
 *      {
 *       character: "Frasier",
 *      lines: 100
 *      }],
 *    season: 1,
 *    epsiode: 1
 *  },
 * ]
 */
function getLinesPerEpisode(data, onlyCharacters = null) {
  const linesData = [];
  data.forEach((d) => {
    if (onlyCharacters && !onlyCharacters.includes(d.character)) {
      return;
    }
    const episodeIndex = linesData.findIndex(
      (e) => e.season === d.season && e.episode === d.episode
    );
    if (episodeIndex === -1) {
      linesData.push({
        season: d.season,
        episode: d.episode,
        characters: [{ character: d.character, lines: 1 }],
      });
    } else {
      const characterIndex = linesData[episodeIndex].characters.findIndex(
        (c) => c.character === d.character
      );
      if (characterIndex === -1) {
        linesData[episodeIndex].characters.push({
          character: d.character,
          lines: 1,
        });
      } else {
        linesData[episodeIndex].characters[characterIndex].lines += 1;
      }
    }
  });

  // sort by season and episode
  linesData.sort((a, b) => {
    if (a.season === b.season) {
      return a.episode - b.episode;
    } else {
      return a.season - b.season;
    }
  });

  // add attribute for

  return linesData;
}

function getCharacterData(data, selectedName) {
  const characterLines = [];
  data.forEach((d) => {
    if (d.character === selectedName) {
      characterLines.push(d.lines);
    }
  });
  return characterLines;
}

function getLinesByCharacterAndSeason(data, selectedName, selectedSeason) {
  const characterLines = [];
  data.forEach((d) => {
    if (
      d.character === selectedName &&
      (d.season === selectedSeason ||
        selectedSeason === "All" ||
        selectedSeason === undefined)
    ) {
      characterLines.push(d.lines);
    }
  });
  return characterLines;
}
