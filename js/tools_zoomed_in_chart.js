// add a single rectangle representing the hovered/clicked exon to the zoomed in chart view
function addZoomedInRectToChart(translateZoomedExon, exonLengths, hoveredExonIndex,
  scaleSingleExonToChart, BASE_PAIRS_OUTSIDE_EXON_LIMIT, exonBarColor, barHeightCoding) {
  var zoomBar = translateZoomedExon.append("g")
      .selectAll("g")
      .data([ exonLengths[hoveredExonIndex] ])
    .enter().append("g")
      .attr("transform", function(d) { 
        return "translate(" + 
          scaleSingleExonToChart(
            BASE_PAIRS_OUTSIDE_EXON_LIMIT
          ) + "," + 0 + ")";
      });

  zoomBar.append("rect")
    .attr("fill", exonBarColor)
    .attr("width", scaleSingleExonToChart)
    .attr("height", function(d) {
      return barHeightCoding;
    });       

  return zoomBar;
}

function getDashedLineCoordinates(barHeightNonCoding, width, scaleSingleExonToChart) {
  var zoomLineCoordinates = [];
  zoomLineCoordinates.push(
    [
      [0, 0], 
      [0, barHeightNonCoding], 
      [scaleSingleExonToChart(BASE_PAIRS_OUTSIDE_EXON_LIMIT), barHeightNonCoding]
    ],
    [
      [width, 0], 
      [width, barHeightNonCoding], 
      [width - scaleSingleExonToChart(BASE_PAIRS_OUTSIDE_EXON_LIMIT), barHeightNonCoding]
    ]);

  return zoomLineCoordinates;
}

// add dashed line to chart which represents intron area outside of exon rectangle
// Tutorial: https://www.dashingd3js.com/svg-paths-and-d3js
function addDashedLineToChart(translateZoomedExon, zoomLineCoordinates) {
  var zoomLine = translateZoomedExon.append("g")
  .selectAll("path")
  .data(zoomLineCoordinates)
  .enter().append("path")
    .style("fill", "none")
    .style("stroke", "black")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", "2,1")
    .attr("d", d3.line());
  
  return zoomLine;
}

// add text next to dashed line that shows the value of BASE_PAIR_OUTSIDE_EXON_LIMIT
// Tutorial: https://www.dashingd3js.com/svg-text-element
function addTextToDashedLine(svgZoomedIn, margin, zoomLineCoordinates, 
  BASE_PAIRS_OUTSIDE_EXON_LIMIT) {
    
  var text = svgZoomedIn.append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + (margin.top / 2) + ")")
      .selectAll("text")
      .data(zoomLineCoordinates)
      .enter().append("text");
  
  var textSize = 10;
  var textLabels = text
      .attr("x", function(d, i) { 
        return d[0][0]; 
      })
      .attr("y", textSize)
      .text(BASE_PAIRS_OUTSIDE_EXON_LIMIT + " bp")
      .attr("font-family", "sans-serif")
      .attr("font-size", textSize + "px");

  return text;
}