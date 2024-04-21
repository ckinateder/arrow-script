class TopCharacters {
  constructor(data, _config, numCharacters = 10) {
    this.config = {
      parentElement: "#topcharacters",
      title: "Top Characters Overall",
      containerWidth: 800,
      containerHeight: 600,
      margin: { top: 50, bottom: 70, right: 20, left: 80 },
      yPadding: 0.1, // padding for the y-axis (percentage of the range)
    };
  }
}
