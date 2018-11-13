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
        var totalLength = this.gene.getSumOfExonLengths(this.gene.getExons())
            + this.gene.getSumOfUniformIntronLengths();

        return d3.scaleLinear()
            .domain([0, totalLength])
            .range([0, this.chartDimension.width - this.chartMargin.left - this.chartMargin.right]);
    }

    addRectToTransform(chartTransform) {
        var scaleOriginalIntronsToUniformIntrons 
            = this.gene.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var exons = this.gene.getExons();
        var exonLengths = this.gene.getExonLengths(exons);
        var exonStarts = this.gene.getExonStarts(exons);
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

    addLinesToTransform(chartTransform) {
        var intronPartitionsWithUniformIntronLength = 
            this.gene.getIntronPartitionsWithUniformIntronLength();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var length = intronPartitionsWithUniformIntronLength.length;
        var nonCodingHeight = this.exonBar.nonCodingHeight;
        var data = [];

        // calculate x,y coordinates of where the dashed lines 
        // representing introns will be drawn
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

    // add white rectangles to the non-coding area in the 
    // first exon that occurs before cdsStart and the non-coding area in the
    // last exon that occurs after cdsEnd, thereby distinguishing the height
    // of the non-coding area with the coding area of those exons
    addNonCodingExonPartitionsToTransform(chartTransform) {
        var nonCodingExonPartitions = this.gene.getNonCodingExonPartitions();
        var scaleOriginalIntronsToUniformIntrons 
            = this.gene.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var codingHeight = this.exonBar.codingHeight;
        var nonCodingHeight = this.exonBar.nonCodingHeight;

        // need to add white rectangles to the top and bottom of the first and last exons,
        // so duplicate the exon start positions and the exon lengths
        var nonCodingExonPartitionStarts = this.gene.getExonStarts(nonCodingExonPartitions);
        var xPositionStarts = nonCodingExonPartitionStarts.concat(nonCodingExonPartitionStarts);
        var nonCodingExonLengths = this.gene.getExonLengths(nonCodingExonPartitions);
        var data = nonCodingExonLengths.concat(nonCodingExonLengths);

        var nonCodingExonBars = chartTransform.append("g")
            .selectAll(".rectNonCodingZoomedOut")
            .data(data)
            .enter().append("rect")
            .classed('rectNonCodingZoomedOut', true)
            .attr("transform", function (d, i) {
                // first two indices draw the top two white rectangles,
                // last two indices draw the bottom two white rectangles
                var yPositionStart = 0;
                if (i > 1) {
                    yPositionStart = codingHeight - (nonCodingHeight / 2);
                }
                return "translate(" + scaleUniformIntronsToChart(
                    scaleOriginalIntronsToUniformIntrons(xPositionStarts[i])
                ) + "," + yPositionStart + ")";
            })
            .attr("fill", "white")
            .attr("width", scaleUniformIntronsToChart)
            .attr("height", function (d, i) {
                return nonCodingHeight / 2;
            });

        return nonCodingExonBars;
    }

    addVariantsToTransform(chartTransform) {
        var variantData = this.gene.getVariants();
        var variantMap = this.gene.getVariantMap();
        var yAxisVariableString = this.yAxisVariableString;
        var scaleOriginalIntronsToUniformIntrons = 
            this.gene.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var scaleVariantFlagToLollipopColor = this.getScaleVariantFlagToLollipopColor();

        console.log("current Y axis variable");
        console.log(yAxisVariableString);

        // clear previous variant visualization
        chartTransform.selectAll("g").remove();

        var lollipopRect = chartTransform.selectAll("g")
            .data(variantData)
            .enter().append("g")
            .attr("transform", function (d) {
            return "translate(" +
                scaleUniformIntronsToChart(
                    scaleOriginalIntronsToUniformIntrons(d.position)
                ) + "," + 0 + ")";
            })
            .append("rect")
            .attr("width", this.variantLollipop.width)
            .attr("height", function (d) {
                return 50;
            })
            .attr('fill', function (d) {
                return scaleVariantFlagToLollipopColor(d.flags);
            });
    }

    getScaleVariantFlagToLollipopColor() {
        var scaleVariantFlagToLollipopColor = d3.scaleOrdinal();
        scaleVariantFlagToLollipopColor.domain([
            "3' UTR", "5' UTR", "downstream gene", "frameshift", "inframe insertion", 
            "intron", "missense", "non coding transcript exon", "splice acceptor", 
            "splice donor", "splice region", "stop gained", "stop lost", "synonymous"
        ]);
        scaleVariantFlagToLollipopColor.range([
            'brown', 'steelblue', 'violet', 'red', 'darkgoldenrod', 
            'gray', 'forestgreen', 'sienna', 'darkkhaki', 'navy', 
            'magenta', 'turquoise', 'deepskyblue', 'orange'
        ]);
        return scaleVariantFlagToLollipopColor;
    }
}