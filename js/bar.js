class CharacterBarChart {
  constructor(data, _config, numCharacters = 10) {
    this.config = {
      parentElement: "#characterbarchart",
      title: "Top Characters Overall",
      yAxisLabel: "Character",
      xAxisLabel: "Number of Lines",
      containerWidth: 800,
      containerHeight: 600,
      margin: { top: 50, bottom: 70, right: 10, left: 80 },
      yPadding: 0.1, // padding for the y-axis (percentage of the range)
    };
    this.computeDimensions();
    this.numCharacters = numCharacters || 10;
    this.updateData(data);

    this.attr1 = "character";
    this.attr2 = "lines";

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

    console.log(this.data);

    // create scales
    this.x = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.lines)])
      .range([vis.config.margin.left, vis.width - vis.config.margin.right]);

    this.y = d3
      .scaleBand()
      .domain(this.data.map((d) => d.character))
      .range([
        (1 + vis.config.yPadding) * vis.config.margin.top,
        vis.height - vis.config.margin.bottom,
      ])
      .padding(0.1);

    // add the bars
    this.bars = this.svg
      .selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", this.x(0))
      .attr("y", (d) => this.y(d.character))
      .attr("width", (d) => this.x(d.lines))
      .attr("height", this.y.bandwidth())
      .attr("fill", "steelblue")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("fill", "orange");
        // add tooltip

        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<div>Character: ${d.character}</div>
            <div>Lines: ${d.lines}</div>
            <div>Episodes: ${d.numEpisodes}</div>`
          );
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", "steelblue");
      });

    // add the x-axis
    this.svg
      .append("g")
      .attr(
        "transform",
        `translate(0, ${this.height - this.config.margin.bottom})`
      )
      .call(d3.axisBottom(this.x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // add the y-axis
    this.svg
      .append("g")
      .call(d3.axisLeft(this.y))
      .attr("transform", `translate(${this.config.margin.left}, 0)`);

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

  render() {}

  updateData(data) {
    this.data = getTopCharactersOverall(data);
    this.data = this.data.slice(0, this.numCharacters);
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
  setNumCharacters(numCharacters) {
    this.numCharacters = numCharacters;
    this.updateData(this.data);
  }
}
