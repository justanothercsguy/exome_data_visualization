// initialize global chart variable in result.html
function initializeCharts(variantJson, geneJson) {
        // remove '&quot;' string and parse json
        var variantData = JSON.parse(variantJson.replace(/&quot;/g,'"'));
        var geneData = JSON.parse(geneJson.replace(/&quot;/g,'"'));

        // sometimes gene table has multiple transcripts of the same gene
        geneData = getGeneTranscriptWithMostExons(geneData);

        console.log(variantData);
        console.log(geneData);

        var cdsStart = (geneData.cdsstart);
        var cdsEnd = (geneData.cdsend);
        var exonStarts = jsonStringArrayToIntArray(geneData.exonstarts);
        var exonEnds = jsonStringArrayToIntArray(geneData.exonends);

        var nonCodingLengthLimit = 200;
        var basePairsOutsideExonLimit = 50; 
        var gene = new Gene(
            cdsStart, cdsEnd, exonStarts, exonEnds, 
            basePairsOutsideExonLimit, variantData, nonCodingLengthLimit
        );

        var chartMargin = {top: 30, right: 30, bottom: 50, left: 120};
        var chartDimension = {width: 1200, height: 300};
        var yAxisVariableString = "MAF";
        var exonBar = {nonCodingHeight: 10, codingHeight: 20, color: "#868686"};
        var variantLollipop = {width: 0.2, radius: 3};

        // global variable in result.html for storing data and drawing charts
        chartController = new ChartController(
            chartMargin, chartDimension, yAxisVariableString, 
            exonBar, variantLollipop, gene
        );
        
        console.log("chartController");
        console.log(chartController);

        console.log("chartController draw zoomed out chart");
        chartController.drawZoomedOutChart();
}
