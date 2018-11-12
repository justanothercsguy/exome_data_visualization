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

    getScaleUniformIntronsToChart() {
        var totalLength = this.gene.getSumOfExonLengths()
            + this.gene.getSumOfUniformIntronLengths();

        return d3.scaleLinear()
            .domain([0, totalLength])
            .range([0, this.chartDimension.width - this.chartMargin.left - this.chartMargin.right]);
    }

    addRectToTransform(chartTransform) {
        var scaleOriginalIntronsToUniformIntrons 
            = this.gene.getScaleOriginalIntronsToUniformIntrons();
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

    addLinesToZoomedOutChart(chartTransform) {
        var intronPartitionsWithUniformIntronLength = 
            this.gene.getIntronPartitionsWithUniformIntronLength();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var length = intronPartitionsWithUniformIntronLength.length;
        var nonCodingHeight = this.exonBar.nonCodingHeight;
        var data = [];

        // calculate coordinates for where the dashed lines represented by introns 
        // will be drawn on the chart
        for (var i = 0; i < length; i++) {
            data.push([
                [
                    scaleUniformIntronsToChart(intronPartitionsWithUniformIntronLength[i].start), 
                    nonCodingHeight
                ],
                [
                    scaleUniformIntronsToChart(intronPartitionsWithUniformIntronLength[i].end), 
                    nonCodingHeight
                ]
            ]);
        }

        var lines = chartTransform.append("g")
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .style("stroke", function (d, i) {
                if (i % 3 != 1) { 
                    return "black";
                }
                return "grey";
            })
            .attr("stroke-width", function (d, i) {
                // controls the height of each dash
                if (i % 3 != 1) { 
                    return nonCodingHeight * 0.5; 
                }
                return nonCodingHeight * 0.25;
            })
            .style("stroke-dasharray", function (d, i) {
                // first number controls width of each dash 
                // second number controls width of spaces between dashes
                if (i % 3 != 1) { 
                    return "2,2"; 
                }
                return "2,1"; 
            })
            .attr("d", d3.line());
        
        return lines;    
    }
}