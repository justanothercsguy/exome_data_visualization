// change y axis variable, which will subsequently cause the whole webpage to reload
function changeYAxisVariable(newYAxisVariable) {

  mainChart.yAxisVariable = newYAxisVariable;
  if (newYAxisVariable == 'MAF') {
      console.log('MAF');
  }
  if (newYAxisVariable == 'alleleNumber') {
      console.log('alleleNumber');
  }
  console.log(mainChart.yAxisVariable);

  var chartZoomedOut = document.getElementsByClassName("chart-zoomed-out")[0];
  var chartZoomedIn = document.getElementsByClassName("chart-zoomed-in")[0];
  console.log(chartZoomedOut);
  console.log(chartZoomedIn);
  console.log(variant_map);
  console.log(variant_data);
}

// create transform wrapper object with two inputs
// the transform handle, and the list containing inputs that the transform needs
// to render data correctly
class TransformWrapper {
  constructor(svgTransformHandle, args) {
    this.svgTransformHandle = svgTransformHandle;
    this.args = args;
  }

  getSvgTransformHandle() {
    return this.svgTransformHandle;
  }

  getArgs() {
    return this.args;
  }
}

// TODO: for each transform wrapper object, clear the transform of existing data visuals
// and re-initialize it by calling the correct transform function using the dictionary
// of inputs in the transform wrapper object
// TODO: change each function that draws data onto a svg transform handle,
// so that instead of a long list of inputs it takes in a transform wrapper 
// with variables for the specific function
// TODO: What happens when I need to update the contents of the transform handle?
// Do I need to create a new wrapper or update an existing one?
// function updateZoomedInChartToYAxisVariable(
//   variantTransformZoomedInWrapper, yAxisTransformZoomedInWrapper) {

//   var variantTransform = variantTransformZoomedInWrapper.getSvgTransformHandle();
//   var variantTransformArgs = variantTransformZoomedInWrapper.getArgs();

//   // update data viz in the variant transform in the zoomed in chart
//   variantTransform.selectAll("g").remove();

//   var lollipopCircle = addLollipopToZoomedInChart(yAxisVariableString, variantTransform, 
//     data, scaleSingleExonToChart, CLICKED_EXON_OFFSET, BASE_PAIRS_OUTSIDE_EXON_LIMIT, 
//     lollipop, yScaleLollipop, variant_map_single_exon);

//   // update data viz in the y axis transform in the zoomed in chart
//   addAxisScaleAndLabelToZoomedInChart(yAxisTransform, height, margin, yScaleLollipop);
  
//   return lollipopCircle;
  
// }

// Since I made yAxisVariable a global variable in index.html, I don't need
// to pass it into this function
function updateZoomedInChartToYAxisVariable(variantTransform, 
  data, scaleSingleExonToChart, CLICKED_EXON_OFFSET, BASE_PAIRS_OUTSIDE_EXON_LIMIT, 
  lollipop, yScaleLollipop, variant_map_single_exon, yAxisTransform, height, margin) {
  
  // clear the transform of all g objects
  variantTransform.selectAll("g").remove();

  var lollipopCircle = addLollipopToZoomedInChart(variantTransform, 
    data, scaleSingleExonToChart, CLICKED_EXON_OFFSET, BASE_PAIRS_OUTSIDE_EXON_LIMIT, 
    lollipop, yScaleLollipop, variant_map_single_exon);

  
  addYAxisScaleAndLabelToZoomedInChart(yAxisTransform, height, margin, yScaleLollipop);
  
  return lollipopCircle;
}


function intializeVariantArray(variant_data_file_path, 
  variant_data_file_name, exonStarts, exonEnds, OFFSET, EXON_COUNT) {
  
  /* Step 13: Use unary symbol to convert strings into numbers, and implement
  * row function to tell d3.csv() how to parse each row in csv file.
  * https://bl.ocks.org/curran/d867264d468b323c2e76886d44e7e8f9
  */
  const row = function(d) {
    const chromosomeString = d['Chrom'];
    const positionString = d['Position'];
    const alleleCountString = d['Allele Count'];
    const alleleNumberString = d['Allele Number'];
    const alleleFrequencyString = d['Allele Frequency'];

    return {
      chromosome: +chromosomeString,
      reference: d['Reference'],
      alternate: d['Alternate'],
      annotation: d['Annotation'],
      position: +positionString,
      alleleCount: +alleleCountString,
      alleleNumber: +alleleNumberString,
      alleleFrequency: +alleleFrequencyString
    };
  };

  d3.csv(variant_data_file_path + variant_data_file_name, row, function(data) {
    // Since variant positions have not been subtracted by OFFSET, add OFFSET to exonStarts and exonEnds 
    // to get threshold values for filtering out variants that are greater than NON_CODING_LENGTH_LIMIT
    // number of base pairs outside of the exon
    const LOWER_THRESHOLD = exonStarts[0] + OFFSET;
    const UPPER_THRESHOLD = exonEnds[EXON_COUNT - 1] + OFFSET;

    data = data.filter(function(d) {
      if (d.position >= LOWER_THRESHOLD && d.position <= UPPER_THRESHOLD) {
        return true;
      }
      return false;
    });
    variant_data = data;
  });
  
  console.log(variant_data);
}


function intializeVariantMap(variantArray) {

  variantArray.forEach(function(variant) {
    var position = variant.position;
    if (!variant_map[position]) {
      variant_map[position] = [variant];
    }
    else {
      variant_map[position].push(variant);
    }
  });
}