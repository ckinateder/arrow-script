/**
 * This class is a stacked line chart that shows the number of lines spoken by each character over time
 * X-axis: episode number
 * Y-axis: number of lines spoken
 */
class LinesOverTime {
  constructor(data, _config) {
    this.config = {
      parentElement: _config.parentElement || "#linesovertime",
      title:
        _config.title ||
        "Average Number of Lines Spoken by Character per Episode",
      yAxisLabel: _config.yAxisLabel || "Number of Lines",
      xAxisLabel: _config.xAxisLabel || "Episode",
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 50, bottom: 40, right: 20, left: 60 },
      yPadding: _config.yPadding || 0.1,
    };

    this.computeDimensions();
    this.updateData(data);
    this.init();
  }
  init() {
    let vis = this; // create svg element
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height);
    this.update();
  }
  update() {
    let vis = this;
    vis.svg.selectAll("*").remove();

    /*
    Data structure:
    [
      {
        characters: [
          {
            character: "Frasier",
            lines: 100
          },
          ...
        ],
        season: 1,
        episode: 1
      },
      ...
    ]
    There are up to 5 characters in each episode
    */

    // create scales
    this.x = d3
      .scaleLinear()
      .domain([0, this.data.length])
      .range([vis.config.margin.left, vis.width - vis.config.margin.right]);

    this.y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.data, (d) => d3.max(d.characters, (c) => c.lines)),
      ])
      .range([vis.height - vis.config.margin.bottom, vis.config.margin.top]);

    // add the axes
    this.xAxis = d3.axisBottom(this.x).tickFormat((d) => {
      if (vis.data[d]) return `${vis.data[d].season}x${vis.data[d].episode}`;
      else return "";
    });
    this.yAxis = d3.axisLeft(this.y);

    vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(0, ${vis.height - vis.config.margin.bottom})`
      )
      .call(this.xAxis);

    vis.svg
      .append("g")
      .attr("transform", `translate(${vis.config.margin.left}, 0)`)
      .call(this.yAxis);

    // color scale for characters
    const color = d3
      .scaleOrdinal()
      .domain(majorCharacters)
      .range(d3.schemeCategory10);

    // for each character, create a line
    majorCharacters.forEach((c) => {
      vis.svg
        .append("path")
        .datum(vis.data)
        .attr("fill", "none")
        .classed("line", true)
        .attr("stroke", color(c))
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line()
            .x((d, i) => {
              return this.x(i);
            })
            .y((d) => {
              // if character is in the episode, return the number of lines
              // otherwise, return 0
              const character = d.characters.find(
                (char) => char.character === c
              );
              if (character) return this.y(character.lines);
              else return this.y(0);
            })
        )
        .on("mouseover", function (event, d) {
          d3.selectAll(".line").style("opacity", 0.1);
          d3.select(this).style("opacity", 1);
          d3.select("#tooltip").style("opacity", 1);

          // get character name
          const character = c;
          // get the episode number
          const index = Math.round(vis.x.invert(d3.pointer(event)[0]));
          // get the number of lines
          const lines = d[index].characters.find(
            (char) => char.character === character
          ).lines;
          // get the season
          const season = d[index].season;
          // get the episode
          const episode = d[index].episode;

          // add tooltip
          d3.select("#tooltip")
            .html(
              `<div>Character: ${character}</div>
                <div>Lines: ${lines}</div>
                <div>Episode: ${season}x${episode}</div>`
            )
            .style("opacity", 1);

          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px");
        })
        .on("mouseout", function (event, d) {
          d3.selectAll(".line").style("opacity", 1);
          d3.select("#tooltip").style("opacity", 0);
        });
    });

    // add the title
    vis.svg
      .append("text")
      .attr("x", vis.width / 2)
      .attr("y", 0 + vis.config.margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(vis.config.title);

    // add y axis label
    vis.svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -vis.height / 2)
      .attr("id", "y-axis-label")
      .attr("dy", ".75em")
      .style("font-size", "12px")
      .text(vis.config.yAxisLabel);

    // add x axis label
    vis.svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", vis.width / 2)
      .attr("y", vis.height - 6)
      .attr("id", "x-axis-label")
      .style("font-size", "12px")
      .text(vis.config.xAxisLabel);
  }
  computeDimensions() {
    this.width =
      this.config.containerWidth -
      this.config.margin.left -
      this.config.margin.right;
    this.height =
      this.config.containerHeight -
      this.config.margin.top -
      this.config.margin.bottom;
  }
  updateData(data) {
    let linesData = getLinesPerEpisode(data, majorCharacters);
    this.data = linesData; //.slice(0, 100);
    console.log(this.data);
  }
}
