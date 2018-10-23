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