// add a single rectangle representing the hovered/clicked exon to the zoomed in chart view
function addZoomedInRectToZoomedInChart(translateZoomedExon, exonLengths, hoveredExonIndex,
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
function addDashedLineToZoomedInChart(translateZoomedExon, zoomLineCoordinates) {

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
function addTextToZoomedInChart(textTransformHandle, margin, zoomLineCoordinates, 
  BASE_PAIRS_OUTSIDE_EXON_LIMIT, textSize) {
    
  var text = textTransformHandle
      .selectAll("text")
      .data(zoomLineCoordinates)
    .enter().append("text")
      .attr("x", function(d, i) { 
        return d[0][0]; 
      })
      .attr("y", textSize)
      .text(BASE_PAIRS_OUTSIDE_EXON_LIMIT + " bp")
      .attr("font-family", "sans-serif")
      .attr("font-size", textSize + "px");

  return text;
}

function addNonCodingRectToZoomedInChart(translateZoomedExon, nonCodingExonLengths,
  barHeightCoding, barHeightNonCoding, nonCodingXPositionStart, scaleSingleExonToChart) {

  var nonCodingBar = translateZoomedExon.append("g")
      .selectAll(".rectNonCodingZoomedIn")
      .data(nonCodingExonLengths)
    .enter().append("rect")
      .classed('rectNonCodingZoomedIn', true)
      .attr("transform", function(d, i) { 
        var yPositionStart = 0;
        if (i == 1) {
          yPositionStart = barHeightCoding - (barHeightNonCoding / 2);
        }
        return "translate(" + (
            nonCodingXPositionStart
          ) + "," + yPositionStart + ")";
      })
      .attr("fill", "white")
      .attr("width", scaleSingleExonToChart)
      .attr("height", function(d, i) {
        return barHeightNonCoding / 2;
      });
  
  return nonCodingBar;
}

function addLollipopToZoomedInChart(variantTransform, 
  data, scaleSingleExonToChart, CLICKED_EXON_OFFSET, BASE_PAIRS_OUTSIDE_EXON_LIMIT, 
  lollipop, yScaleLollipop, variant_map_single_exon) {
  
  var yAxisVariableString = chartController.yAxisVariableString;

  var lollipopRect = variantTransform.append("g")
      .selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d) {
        return "translate(" + 
          scaleSingleExonToChart(
            d.position - CLICKED_EXON_OFFSET + BASE_PAIRS_OUTSIDE_EXON_LIMIT
          ) + "," + 0 + ")";
      })
      .append("rect")
      .attr("width", lollipop.width)
      .attr("height", function(d) {
        if (yAxisVariableString == 'MAF') {
          return yScaleLollipop(variant_map_single_exon[d.position][0].alleleFrequency);
        }
        else if (yAxisVariableString == 'alleleNumber') {
          return yScaleLollipop(variant_map_single_exon[d.position][0].alleleNumber);
        } 
      })
      .attr('fill', function(d) {
        return variantAnnotationToLollipopColor(d.annotation);
      });

  var lollipopCircle = variantTransform.append("g")
      .selectAll('circle')
      .data(data)
    .enter().append('circle')
      .attr('cx', function(d) {
        return scaleSingleExonToChart(
          d.position - CLICKED_EXON_OFFSET + BASE_PAIRS_OUTSIDE_EXON_LIMIT
        );
      })
      .attr('cy', function(d) {
        if (yAxisVariableString == 'MAF') {
          return yScaleLollipop(variant_map_single_exon[d.position][0].alleleFrequency);
        }
        else if (yAxisVariableString == 'alleleNumber') {
          return yScaleLollipop(variant_map_single_exon[d.position][0].alleleNumber);
        } 
      })
      .attr('r', lollipop.radius)
      .attr('fill', function(d) {
        return variantAnnotationToLollipopColor(d.annotation);
      });
  
  return lollipopRect;
}

function addYAxisScaleAndLabelToZoomedInChart(yAxisTransform, height, margin, yScaleLollipop) {

  yAxisTransform.append("g").append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", - 10)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text(chartController.yAxisVariableString);

  yAxisTransform.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + (margin.left / 2) + "," + 
      0 + ")")
    .call(d3.axisLeft(yScaleLollipop));
}