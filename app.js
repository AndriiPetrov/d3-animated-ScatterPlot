var height = 600;
var width = 700;
var margin = { top: 25, right: 20, bottom: 50, left: 65 };

const canvas = d3.select("div");

const svg = canvas
  .append("svg") //.attr("viewBox", [0, 0, width, height]);
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data.json").then((data) => {
  var color2 = data.color.split(",");
  var title = data.title;
  var xAxisLabel = data.xAxisLabel;
  var yAxisLabel = data.yAxisLabel;
  var data = data.data[0];

  // conversion function for x -axis
  var x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.value))
    .nice() // for x-axis looking nice
    .range([margin.left, width - margin.right]);

  // conversion function for y - axis
  var y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.value2))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Set colors for the circles
  var color = d3.scaleOrdinal(
    color2
  );

  var shape = d3.scaleOrdinal(
    data.map((d) => d.name),
    d3.symbols.map((s) => d3.symbol().type(s)())
  );

  var xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", (width + margin.left) / 2)
          .attr("y", margin.bottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "middle")
          .text(xAxisLabel)
          .attr("font-size", 16)
      );

  var yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", (-height + margin.top) / 2)
          .attr("y", -margin.left - 15)
          .attr("fill", "currentColor")
          .attr("transform", "rotate(-90)")
          .attr("text-anchor", "middle")
          .text(yAxisLabel)
          .attr("font-size", 16)
      );

  var grid = (g) =>
    g
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(x.ticks())
          .join("line")
          .attr("x1", (d) => 0.5 + x(d))
          .attr("x2", (d) => 0.5 + x(d))
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom)
      )
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y.ticks())
          .join("line")
          .attr("y1", (d) => 0.5 + y(d))
          .attr("y2", (d) => 0.5 + y(d))
          .attr("x1", margin.left)
          .attr("x2", width - margin.right)
      );

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);

  svg.append("g").call(grid);

  // Define the div for the tooltip
  var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  // **** Add the Circles to the grid **** //
  // Set Y-domain to zero, for the start position of the dots(animation purpose)
  y.domain([0, 0]);
  y.range([height - margin.bottom, height - margin.bottom]);

  // Data set for the legend and for bounding dots with the legend
  var dataForLegend = new Set();
  data.forEach((d) => dataForLegend.add(d.name));
  var dataSet = Array.from(dataForLegend);

  // Add the circles(dots) to the dashboard
  var dots = svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.value))
    .attr("cy", (d) => y(d.value2))
    .attr("r", 3)
    .attr("fill", (d) => color(d.name))
    .attr("class", (d, i) => {
      for (var j = 0; j < dataSet.length; j++) {
        if (dataSet[j] === d.name) return "ti-circle" + j;
      }
    });

  // Change yScale to the normal position mapping(animation purpose)
  y.domain(d3.extent(data, (d) => +d.value2))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Set tooltip events for the Circles(dots) 
  dots
    .on("mouseover", function (d) {
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(d.name + "<br/>" + d.value + "<br/>" + d.value2)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(300).style("opacity", 0);
    })
  
  // Animation: change position of the dots to normal
  dots
    .transition()
    .duration(1000)
    .attr("cx", (d) => x(d.value))
    .attr("cy", (d) => y(d.value2));

    // **** End adding circles(dots) **** //

  // Add a Title;
  svg
    .append("g")
    .attr("transform", `translate(${(width + 30) / 2}, ${-5})`)
    .append("text")
    .attr("font-size", 24)
    .text(title)
    .attr("text-anchor", "middle");

  var legend = svg.append("g"); // Legend in General

  var widthForElement = margin.left; // X-axis point for each element;

  dataSet.forEach((data, i) => {
    eachLegend = legend.append("g");

    // add circle for the legend;
    eachLegend.append("circle").attr("cx", widthForElement).attr("cy", 10).attr("r", 5).attr("fill", color(data));

    // add text to the legend;
    eachLegend
      .append("text")
      .attr("transform", `translate(${widthForElement + 10}, 15)`)
      .text(data);

    // add the Event listener to the Legend;
    eachLegend
      .on("mouseenter", () => {
        d3.selectAll("[class*=ti-circle]:not(.ti-circle" + i + ")").attr("fill-opacity", 0.3);
      })
      .on("mouseleave", () => {
        d3.selectAll("[class*=ti-circle]:not(.ti-circle" + i + ")").attr("fill-opacity", 1);
      });

    // calculate: widthText + withCircle and Remove it after calculating;  
    var width = legend.append("text").text(data);
    widthForElement += width.node().getBBox().width + 25;
    width.remove();
  });
});
