// change y axis variable, which will subsequently cause the whole webpage to reload
function changeYAxisVariable(yAxisVariable) {

  if (yAxisVariable == 'MAF') {
      console.log('MAF');
  }
  if (yAxisVariable == 'alleleNumber') {
      console.log('alleleNumber');
  }

  var chartZoomedOut = document.getElementsByClassName("chart-zoomed-out")[0];
  var chartZoomedIn = document.getElementsByClassName("chart-zoomed-in")[0];
  console.log(chartZoomedOut);
  console.log(chartZoomedIn);
  console.log(variant_map);

}

// create transform wrapper object with two inputs
// the transform handle, and the list containing inputs that the transform needs
// to render data correctly


// for each transform wrapper object, clear the transform of existing data visuals
// and re-initialize it by calling the correct transform function using the list
// of inputs in the transform wrapper object
function updateZoomedInChartToYAxisVariable(variantTransform, yAxisVariableString, 
  variantTransform, data, scaleSingleExonToChart, CLICKED_EXON_OFFSET, 
  BASE_PAIRS_OUTSIDE_EXON_LIMIT, lollipop, yScaleLollipop, variant_map_single_exon, 
  yAxisTransform, height, margin) {
  
  // clear the transform of all g objects
  variantTransform.selectAll("g").remove();

  var lollipopCircle = addLollipopToZoomedInChart(yAxisVariableString, variantTransform, 
    data, scaleSingleExonToChart, CLICKED_EXON_OFFSET, BASE_PAIRS_OUTSIDE_EXON_LIMIT, 
    lollipop, yScaleLollipop, variant_map_single_exon);

    addAxisScaleAndLabelToZoomedInChart(yAxisTransform, height, margin, yScaleLollipop);
  
  return lollipopCircle;
}