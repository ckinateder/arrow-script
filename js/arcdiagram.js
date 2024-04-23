class ArcDiagram {
  constructor(_data, _config) {
    this.config = {
      parentElement: _config.parentElement || "#arcdiagram",
      title: _config.characterDropdownElement || "Character Interaction",
      containerWidth: _config.containerWidth || 1400,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      seasonDropdownElement:
        _config.seasonDropdownElement || "#arc-season-select",
      yPadding: 0.1, // padding for the y-axis (percentage of the range)
    };
    this.data = _data;
    // // this.computeDimensions();
    // // this.updateData(data);
    this.selectedSeason = "All";
    this.offset = 30;
    this.initVis();
  }
  initVis() {
    let vis = this;
    // Set the dimensions and margins of the graph
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Append the svg object to the parent element
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );
    // add season dropdown
    d3.select(vis.config.seasonDropdownElement)
      .selectAll("option")
      .data(seasons)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

    d3.select(vis.config.seasonDropdownElement).on("change", function () {
      vis.setSeason(this.value);
      vis.updateVis();
    });

    this.updateVis();
  }
  updateVis() {
    let vis = this;
    vis.svg.selectAll("*").remove();
    // Extracting data
    let seasonData = vis.data.filter((d) => {
      if (vis.selectedSeason === "All" || vis.selectedSeason === undefined) {
        return true;
      } else {
        return d.season === vis.selectedSeason;
      }
    });
    let transcriptOrder = seasonData.map(function (d) {
      return d.character;
    });

    let arcData = vis.getCharacterInteractions(transcriptOrder);
    let nameData = vis.getCharacterNames(arcData);
    // Create a linear scale for positioning the nodes on the X axis
    const x = d3.scalePoint().range([0, vis.width]).domain(nameData);

    // Create an object for easy access to node data
    const idToNode = {};
    arcData.forEach((node) => {
      idToNode[node.id] = node;
    });

    // make color scale with domain from 0 to highest value in the data
    // low is blue, high is red
    const color = d3
      .scaleSequential()
      .domain([0, d3.max(arcData, (d) => d.value)])
      .interpolator(d3.interpolate("rgb(108,99,255)", "red"));

    // scale for the width of the links
    const scale = d3
      .scaleLinear()
      .domain([0, d3.max(arcData, (d) => d.value)])
      .range([1, 5]);

    // Add links between nodes
    vis.svg
      .selectAll("mylinks")
      .data(arcData)
      .enter()
      .append("path")
      .classed("arc", true)
      .attr("d", function (d) {
        const start = x(d.source); // X position of start node on the X axis
        const end = x(d.target); // X position of end node
        return [
          "M",
          start,
          vis.height - vis.offset, // Arc starts at the coordinate x=start, y=height-vis.offset (where the starting node is)
          "A", // We're gonna build an elliptical arc
          (start - end) / 2,
          ",", // Coordinates of the inflexion point. Height of this point is proportional with start - end distance
          (start - end) / 2,
          0,
          0,
          ",",
          start < end ? 1 : 0,
          end,
          ",",
          vis.height - vis.offset,
        ] // Arc is always on top. So if end is before start, putting 0 here turns the arc upside down.
          .join(" ");
      })
      .style("fill", "none")
      .attr("stroke", (d) => color(d.value))
      .attr("stroke-width", (d) => scale(d.value));

    // Add circles for the nodes
    const nodes = vis.svg
      .selectAll("mynodes")
      .data(nameData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d))
      .attr("cy", vis.height - vis.offset)
      .attr("r", 8)
      .style("fill", fillColor)
      .on("mousemove", function (event, d) {
        if (d == null) return;
        d3.select(this).style("fill", accentColor);

        // double the stroke width of all paths that have this node as source or target
        d3.selectAll(".arc").style("opacity", function (path) {
          if (path === null) return;
          if (d === path.source || d === path.target) {
            return 1;
          } else {
            return 0.1;
          }
        });

        // show tooltip

        // get element in arcData that corresponds to this node
        const nodeData = arcData.find(
          (node) => node.source === d || node.target === d
        );
        let message = `<div><strong>${nodeData.source} <> ${nodeData.target}</strong></div>`;
        message += `<div>${nodeData.value} interactions</div>`;

        // get the position of the tooltip
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(message)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select("#tooltip").style("opacity", 0);
        if (d == null) return;
        d3.select(this).style("fill", fillColor);
        d3.selectAll(".arc").style("opacity", 1);
      });

    // Add labels for the nodes
    const labels = vis.svg
      .selectAll("mylabels")
      .data(nameData)
      .enter()
      .append("text")
      .attr("x", (d) => x(d))
      .attr("y", vis.height - 10)
      .text((d) => d)
      .style("text-anchor", "middle")
      .style("font-size", "11px");

    // Add  background for title
    vis.svg
      .append("rect")
      .attr("x", vis.width / 2 - 110)
      .attr("y", 5)
      .attr("width", 230)
      .attr("height", 20)
      .style("fill", "white")
      .style("opacity", 0.99);

    // Add title
    vis.svg
      .append("text")
      .attr("x", vis.width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(vis.config.title);
  }

  getCharacterInteractions(namesArray) {
    const interactionCounts = [];

    // Iterate through the array of names
    for (let i = 0; i < namesArray.length - 1; i++) {
      const sourceName = namesArray[i];
      const targetName = namesArray[i + 1];

      // Check if the next name is different and not "NA"
      if (
        sourceName !== targetName &&
        sourceName !== "NA" &&
        targetName !== "NA"
      ) {
        // Check if this interaction is already counted with sourceName as source and targetName as target
        let existingInteraction = interactionCounts.find(
          (interaction) =>
            interaction.source === sourceName &&
            interaction.target === targetName
        );

        // Check if this interaction is already counted with targetName as source and sourceName as target
        let reverseExistingInteraction = interactionCounts.find(
          (interaction) =>
            interaction.source === targetName &&
            interaction.target === sourceName
        );

        if (existingInteraction) {
          // If interaction already exists, increment the value
          existingInteraction.value++;
        } else if (reverseExistingInteraction) {
          // If reverse interaction exists, increment its value
          reverseExistingInteraction.value++;
        } else {
          // If neither interaction exists, create a new entry
          interactionCounts.push({
            source: sourceName,
            target: targetName,
            value: 1,
          });
        }
      }
    }
    interactionCounts.sort((a, b) => b.value - a.value);
    const topInteractions = interactionCounts.slice(0, 20);
    return topInteractions;
  }
  getCharacterNames(topInteractions) {
    // Create a Set to store unique names
    const uniqueNamesSet = new Set();

    // Iterate through each interaction object in the topInteractions array
    topInteractions.forEach((interaction) => {
      // Add the source and target names to the Set
      uniqueNamesSet.add(interaction.source);
      uniqueNamesSet.add(interaction.target);
    });

    // Convert the Set back to an array to maintain the order
    const uniqueNamesArray = Array.from(uniqueNamesSet);

    return uniqueNamesArray;
  }
  setSeason(newSeason) {
    this.selectedSeason = newSeason;
  }
}
