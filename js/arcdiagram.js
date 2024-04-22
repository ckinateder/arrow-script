class ArcDiagram{
    constructor(_data, _config) {
        this.config = {
          parentElement: "#arcdiagram",
          title: "Character Interaction",
          containerWidth: 1000,
          containerHeight: 600,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
          yPadding: 0.1, // padding for the y-axis (percentage of the range)
        };
        this.data = _data
        // // this.computeDimensions();
        // // this.updateData(data);
        this.initVis();
      }
      initVis() {
        let vis = this;
    
        // Extracting data
        let transcriptOrder = vis.data.map(function(d) {
          return d.charactername;
        });
        let arcData = vis.getCharacterInteractions(transcriptOrder);
        let nameData = vis.getCharacterNames(arcData);
    
        // Set the dimensions and margins of the graph
        const margin = vis.config.margin;
        const width = vis.config.containerWidth - margin.left - margin.right;
        const height = vis.config.containerHeight - margin.top - margin.bottom;
    
        // Append the svg object to the parent element
        const svg = d3.select(vis.config.parentElement)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Create a linear scale for positioning the nodes on the X axis
        const x = d3.scalePoint()
          .range([0, width])
          .domain(nameData);
    
        // Add circles for the nodes
        svg.selectAll("mynodes")
          .data(nameData)
          .enter()
          .append("circle")
          .attr("cx", d => x(d))
          .attr("cy", height - 30)
          .attr("r", 8)
          .style("fill", "#69b3a2");
    
        // Add labels for the nodes
        svg.selectAll("mylabels")
          .data(nameData)
          .enter()
          .append("text")
          .attr("x", d => x(d))
          .attr("y", height - 10)
          .text(d => d)
          .style("text-anchor", "middle")
          .style("font-size", "6px");
    
        // Create an object for easy access to node data
        const idToNode = {};
        arcData.forEach(node => {
          idToNode[node.id] = node;
        });
    
        // Add links between nodes
        svg.selectAll('mylinks')
          .data(arcData)
          .enter()
          .append('path')
          .attr('d', function(d) {
            const start = x(d.source); // X position of start node on the X axis
            const end = x(d.target); // X position of end node
            return ['M', start, height - 30, // Arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                'A', // We're gonna build an elliptical arc
                (start - end) / 2, ',', // Coordinates of the inflexion point. Height of this point is proportional with start - end distance
                (start - end) / 2, 0, 0, ',',
                start < end ? 1 : 0, end, ',', height - 30
              ] // Arc is always on top. So if end is before start, putting 0 here turns the arc upside down.
              .join(' ');
          })
          .style("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", d => d.value/1000); 


            
      }

      updateVis(){
        this.renderVis();
      }
      renderVis(){

      }
      getCharacterInteractions(namesArray) {
        const interactionCounts = [];
      
        // Iterate through the array of names
        for (let i = 0; i < namesArray.length - 1; i++) {
          const sourceName = namesArray[i];
          const targetName = namesArray[i + 1];
      
          // Check if the next name is different and not "NA"
          if (sourceName !== targetName && sourceName !== "NA" && targetName !== "NA") {
            // Check if this interaction is already counted with sourceName as source and targetName as target
            let existingInteraction = interactionCounts.find(interaction => interaction.source === sourceName && interaction.target === targetName);
      
            // Check if this interaction is already counted with targetName as source and sourceName as target
            let reverseExistingInteraction = interactionCounts.find(interaction => interaction.source === targetName && interaction.target === sourceName);
      
            if (existingInteraction) {
              // If interaction already exists, increment the value
              existingInteraction.value++;
            } else if (reverseExistingInteraction) {
              // If reverse interaction exists, increment its value
              reverseExistingInteraction.value++;
            } else {
              // If neither interaction exists, create a new entry
              interactionCounts.push({ source: sourceName, target: targetName, value: 1 });
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
        topInteractions.forEach(interaction => {
          // Add the source and target names to the Set
          uniqueNamesSet.add(interaction.source);
          uniqueNamesSet.add(interaction.target);
        });
      
        // Convert the Set back to an array to maintain the order
        const uniqueNamesArray = Array.from(uniqueNamesSet);
      
        return uniqueNamesArray;
      }
             
}