
// initializes global chart variable
class ChartController {
  constructor(yAxisVariableString, margin, dimension, exonBarColor) {
    this.yAxisVariableString = yAxisVariableString;
    this.margin = margin;
    this.dimension = dimension;
    this.exonBarColor = exonBarColor;
  }

  setYAxisVariableString(yAxisVariableString) {
    this.yAxisVariableString = yAxisVariableString;
  }
  
}

// return y axis scale scale function based on input variable and height of chart
function getYAxisScaleFromVariable(variable, height, variantData) {
  var yScaleMin = null;
  var yScaleMax = null;
  var yScaleMinExponent = null;
  var yScaleLollipop = null;

  if (variable == 'MAF') {
    console.log("MAF");
    // Get the exponential level of the minimum value, and set yScaleMin to 1 * 10^(exponent)
    // So if min = 2.05 * 10^(-6), then yScaleMin = 1 * 10^(-6)
    // Default y axis variable is allele frequency
    yScaleMin = d3.min(variantData, function(d) { return d.alleleFrequency; });
    yScaleMinExponent = Math.floor( Math.log(yScaleMin) / Math.log(10) );
    yScaleMin = Math.pow(10, yScaleMinExponent);

    yScaleLollipop = d3.scaleLog()
      .domain([ yScaleMin, 1 ])
      .range([ 0, height ]);
  }
  else if (variable == 'alleleNumber') {
    console.log("alleleNumber");
    yScaleMin = d3.min(variantData, function(d) { return d.alleleNumber; });
    yScaleMax = d3.max(variantData, function(d) { return d.alleleNumber; });
 
    yScaleLollipop = d3.scaleLinear()
      .domain([ yScaleMin, yScaleMax ])
      .range([ 0, height ]);
  }

  return yScaleLollipop;
}

function addSvgToChart(margin, dimension, divName) {
  var svgChartHandle = d3.select(divName).append("svg")
    .attr("width", dimension.width + margin.left + margin.right)
    .attr("height", dimension.height + margin.top + margin.bottom);

  return svgChartHandle;
}

function addTransformToSvgHandle(svgHandle, x, y) {
  var transformHandle = svgHandle.append("g")
    .attr("transform", "translate(" + x + "," + y + ")");

  return transformHandle;
}

function clearDataFromTransformHandle(transformHandle, dataType) {
  transformHandle.selectAll(dataType).remove();
}

function addTooltip() {
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("font-size", 8);

  return tooltip;
}

// for some reason passing this to tooltip.html() causes values to be displayed as undefined
function getVariantInformationForTooltip(variant) {
  // console.log(variant);
  return (
    "chromosome: " + variant_map[d.position][0].chromosome + "<br/>"
    + "position: " + variant_map[d.position][0].position + "<br/>"
    + "referenceAllele: " + variant_map[d.position][0].reference + "<br/>"
    + "alternateAllele: " + variant_map[d.position][0].alternate + "<br/>"
    + "annotation: " + variant_map[d.position][0].annotation + "<br/>"
    + "alleleCount: " + variant_map[d.position][0].alleleCount + "<br/>"
    + "alleleNumber: " + variant_map[d.position][0].alleleNumber + "<br/>"
    + "alleleFrequency: " + variant_map[d.position][0].alleleFrequency + "<br/>"
    + "number of variants: " + variant_map[d.position].length
  )
}

