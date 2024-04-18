d3.csv("data/small.csv").then((data) => {
  console.log(`decoding ${data.length} rows`);

  processedData = [];

  data.forEach((d) => {
    console.log(d);
  });
});
