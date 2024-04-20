const excludeCharacters = [">>>>>>> master", "=======", "<<<<<<< HEAD"];
const fillColor = "steelblue";
const accentColor = "orange";

d3.csv("data/transcripts.csv").then((data) => {
  console.log(`decoding ${data.length} rows`);
  processedData = [];
  data.forEach((d) => {
    /*
    Keep only the columns we need:
        "character",
        "charactername",
        "charactertype",
        "gender",
        "title",
        "lines",
        "season",
        "episode",
    */
    const p = {
      character: d.character,
      charactername: d.charactername,
      charactertype: d.charactertype,
      gender: d.gender,
      title: d.title,
      lines: d.lines,
      season: d.season,
      episode: d.episode,
    };

    if (p.character in excludeCharacters) {
    } else processedData.push(p);
  });
  console.log(`processed ${processedData.length} rows`);
  console.log(processedData[0]);

  const barChart = new CharacterBarChart(data);
});
