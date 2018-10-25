// add text representing name of gene to the zoomed out chart
function addTextToZoomedOutChart(textTransformZoomedOut, text, textSize) {

  var text = textTransformZoomedOut.append("g").
      selectAll("text")
      .data(text)
    .enter().append("text")
      .attr("x", 0)
      .attr("y", function(d, i) { 
        return (i * textSize); 
      })
      .text(function(d, i) { return d; })
      .attr("font-family", "sans-serif")
      .attr("font-size", textSize + "px");

  return text;
}

// add rectangle representing exons to a svg transform handle
function addRectToZoomedOutChart(chartTransform, exonLengths, scaleUniformIntronsToChart,
  exonStartsWithUniformIntronLengths, exonBarColor, barHeightCoding) {

  var bar = chartTransform.selectAll("g")
    .data(exonLengths)
    .enter().append("g")
    .attr("transform", function (d, i) {
      return "translate(" + scaleUniformIntronsToChart(exonStartsWithUniformIntronLengths[i])
        + "," + 0 + ")";
    });

  bar.append("rect")
    .attr("fill", exonBarColor)
    .attr("width", scaleUniformIntronsToChart)
    .attr("height", function (d, i) {
      return barHeightCoding;
    });

  return bar;
}

function getIntronStartsAndEndsWithUniformIntronLength(scaleUniformIntronsToChart,
  exonStartsWithUniformIntronLengths, exonEndsWithUniformIntronLengths, NUM_EXONS) {
  var intronStartsAndEndsWithUniformIntronLength = [];

  // originally from i = 1 to NUM_EXONS, but I removed nonCoding partitions so i = 0 now
  for (var i = 0; i < NUM_EXONS - 1; i++) {
    var start1 = [scaleUniformIntronsToChart(exonEndsWithUniformIntronLengths[i]), barHeightNonCoding];
    var end1 = [scaleUniformIntronsToChart(exonEndsWithUniformIntronLengths[i] + INTRON_LENGTH_SPLIT_INTO_THREE), barHeightNonCoding];
    var start2 = [scaleUniformIntronsToChart(exonEndsWithUniformIntronLengths[i] + INTRON_LENGTH_SPLIT_INTO_THREE), barHeightNonCoding];
    var end2 = [scaleUniformIntronsToChart(exonStartsWithUniformIntronLengths[i + 1] - INTRON_LENGTH_SPLIT_INTO_THREE), barHeightNonCoding];
    var start3 = [scaleUniformIntronsToChart(exonStartsWithUniformIntronLengths[i + 1] - INTRON_LENGTH_SPLIT_INTO_THREE), barHeightNonCoding];
    var end3 = [scaleUniformIntronsToChart(exonStartsWithUniformIntronLengths[i + 1]), barHeightNonCoding];
    intronStartsAndEndsWithUniformIntronLength.push([start1, end1]);
    intronStartsAndEndsWithUniformIntronLength.push([start2, end2]);
    intronStartsAndEndsWithUniformIntronLength.push([start3, end3]);
  }

  return intronStartsAndEndsWithUniformIntronLength;
}

// add dashed lines representing intron area between exons
// the sides of the intron area up to BASE_PAIRS_EXON_LIMIT are darkened to show that 
// variants are still shown in those areas, while the middle section is lighter to show
// that variants are not shown in the middle area
function addIntronLinesToZoomedOutChart(chartTransform, intronStartsAndEndsWithUniformIntronLength) {
  var lines = chartTransform.append("g")
    .selectAll("path")
    .data(intronStartsAndEndsWithUniformIntronLength)
    .enter().append("path")
    .style("stroke", function (d, i) {
      if (i % 3 != 1) { return "black"; }
      return "grey";
    })
    .attr("stroke-width", function (d, i) {
      if (i % 3 != 1) { return 4; }
      return 2;
    })
    .style("stroke-dasharray", function (d, i) {
      if (i % 3 != 1) { return "2,2"; }
      return "2,1";
    })
    .attr("d", d3.line());

  return lines;
}

// add white rectangles to area that occur before cdsStart and area that occurs after cdsEnd
function addNonCodingRectToZoomedOutChart(chartTransform, nonCodingExonLengths, barHeightCoding,
  barHeightNonCoding, nonCodingXPositionStarts, scaleUniformIntronsToChart) {

  var nonCodingBar = chartTransform.append("g")
    .selectAll(".rectNonCodingZoomedOut")
    .data(nonCodingExonLengths)
    .enter().append("rect")
    .classed('rectNonCodingZoomedOut', true)
    .attr("transform", function (d, i) {
      var yPositionStart = 0;
      if (i < 2) {
        yPositionStart = barHeightCoding - (barHeightNonCoding / 2);
      }
      return "translate(" + scaleUniformIntronsToChart(
        nonCodingXPositionStarts[i]
      ) + "," + yPositionStart + ")";
    })
    .attr("fill", "white")
    .attr("width", scaleUniformIntronsToChart)
    .attr("height", function (d, i) {
      return barHeightNonCoding / 2;
    });

  return nonCodingBar;
}

function addLollipopToZoomedOutChart(variantTransform, variantData, lollipop, OFFSET,
  scaleUniformIntronsToChart, scaleVariableIntronsToUniformIntrons, yScaleLollipop) {

  var yAxisVariableString = chartController.yAxisVariableString;
  console.log(yAxisVariableString);
  
  var lollipopRect = variantTransform.selectAll("g")
    .data(variantData)
    .enter().append("g")
    .attr("transform", function (d) {
      return "translate(" +
        scaleUniformIntronsToChart(
          scaleVariableIntronsToUniformIntrons(d.position - OFFSET)
        ) + "," + 0 + ")";
    })
    .append("rect")
    .attr("width", lollipop.width)
    .attr("height", function (d) {
      if (yAxisVariableString == 'MAF') {
        return yScaleLollipop(variant_map[d.position][0].alleleFrequency);
      }
      else if (yAxisVariableString == 'alleleNumber') {
        return yScaleLollipop(variant_map[d.position][0].alleleNumber);
      }
    })
    .attr('fill', function (d) {
      return variantAnnotationToLollipopColor(d.annotation);
    });

  var lollipopCircle = variantTransform.selectAll('circle')
    .data(variantData)
    .enter().append("g").append('circle')
    .attr('cx', function (d) {
      return scaleUniformIntronsToChart(
        scaleVariableIntronsToUniformIntrons(d.position - OFFSET)
      );
    })
    .attr('cy', function (d) {
      if (yAxisVariableString == 'MAF') {
        return yScaleLollipop(variant_map[d.position][0].alleleFrequency);
      }
      else if (yAxisVariableString == 'alleleNumber') {
        return yScaleLollipop(variant_map[d.position][0].alleleNumber);
      }
    })
    .attr('r', lollipop.radius)
    .attr('fill', function (d) {
      return variantAnnotationToLollipopColor(d.annotation);
    });

  return lollipopCircle;
}