function addTooltip() {
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("font-size", 10);

    return tooltip;
}

class ChartController {
    constructor(chartMargin, chartDimension, yAxisVariableString, 
        exonBar, variantLollipop, gene) 
    {
        this.chartMargin = chartMargin;
        this.chartDimension = chartDimension;
        this.yAxisVariableString = yAxisVariableString;
        this.exonBar = exonBar;
        this.variantLollipop = variantLollipop;
        this.gene = gene;
    }

    addSvgToDiv(divName) {
        var svgChartHandle = d3.select(divName).append("svg")
            .attr("width", this.chartDimension.width)
            .attr("height", this.chartDimension.height);
    
        return svgChartHandle;
    }

    addTransformToSvg(svgHandle, x, y) {
        var transformHandle = svgHandle.append("g")
          .attr("transform", "translate(" + x + "," + y + ")");
      
        return transformHandle;
    }

    getScaleOriginalIntronsToUniformIntrons() {
        return d3.scaleLinear()
            .domain(this.gene.getDomain())
            .range(this.gene.getRange());
    }

    getScaleUniformIntronsToChart() {
        var totalLength = this.gene.getSumOfExonLengths()
            + this.gene.getSumOfUniformIntronLengths();

        return d3.scaleLinear()
            .domain([0, totalLength])
            .range([0, this.chartDimension.width - this.chartMargin.left - this.chartMargin.right]);
    }

    addRectToTransform(chartTransform) {
        var scaleOriginalIntronsToUniformIntrons = this.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var exonLengths = this.gene.getExonLengths();
        var exonStarts = this.gene.getExonStarts(this.gene.getExons());
        var exonBar = this.exonBar;

        var bar = chartTransform.selectAll("g")
            .data(exonLengths)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + scaleUniformIntronsToChart(
                    scaleOriginalIntronsToUniformIntrons(exonStarts[i])
                ) + "," + 0 + ")";
            });
    
        bar.append("rect")
            .attr("fill", exonBar.color)
            .attr("width", scaleUniformIntronsToChart)
            .attr("height", function (d, i) {
                return exonBar.codingHeight;
            });
    
        return bar;
    }

}