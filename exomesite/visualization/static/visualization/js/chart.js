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
        this.tooltip = addTooltip();
        this.hoveredExonIndex = -1;
        this.variantTransformZoomedOut = null;
        this.variantTransformZoomedIn = null;
        this.yAxisTransformZoomedIn = null;
    }
    
    getChartHeight() {
        return this.chartDimension.height 
            - this.chartMargin.top - this.chartMargin.bottom;
    }

    getChartWidth() {
        return this.chartDimension.width 
            - this.chartMargin.left - this.chartMargin.right;
    }

    setYAxisVariableString(yAxisVariableString) {
        this.yAxisVariableString = yAxisVariableString;
    }
    
    getTooltip() {
        return this.tooltip;
    }
    
    getHoveredExonIndex() {
        return this.hoveredExonIndex;
    }

    setHoveredExonIndex(hoveredExonIndex) {
        this.hoveredExonIndex = hoveredExonIndex;
    }

    getVariantTransformZoomedOut() {
        return this.variantTransformZoomedOut;
    }

    setVariantTransformZoomedOut(variantTransformZoomedOut) {
        this.variantTransformZoomedOut = variantTransformZoomedOut;
    }

    getVariantTransformZoomedIn() {
        return this.variantTransformZoomedIn;
    }

    setVariantTransformZoomedIn(variantTransformZoomedIn) {
        this.variantTransformZoomedIn = variantTransformZoomedIn;
    }

    getYAxisTransformZoomedIn() {
        return this.yAxisTransformZoomedIn;
    }

    setYAxisTransformZoomedIn(yAxisTransformZoomedIn) {
        this.yAxisTransformZoomedIn = yAxisTransformZoomedIn;
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
            .range([0, this.getChartWidth()]);
    }

    drawZoomedOutChart() {
        // initialize svg object and transforms for zoomed out chart
        var svgZoomedOut = this.addSvgToDiv(".chart-zoomed-out");
        var exonTransformZoomedOut = this.addTransformToSvg(
            svgZoomedOut, this.chartMargin.left, 
            this.chartMargin.top
        );
        var yGapBetweenExonsAndVariants = 5;
        var variantTransformZoomedOut = this.addTransformToSvg(
            svgZoomedOut, this.chartMargin.left, 
            (this.chartMargin.top 
                + this.exonBar.codingHeight 
                + yGapBetweenExonsAndVariants)
        );
        this.setVariantTransformZoomedOut(variantTransformZoomedOut);

        // render exons and introns in the exon transform handle for zoomed out chart
        var exonBars = this.addZoomedOutExonsToTransform(exonTransformZoomedOut);
        var intronLines = this.addZoomedOutIntronsToTransform(exonTransformZoomedOut);    
        var nonCodingExonBars = 
            this.addZoomedOutNonCodingExonPartitionsToTransform(exonTransformZoomedOut);
        
        console.log("chart add variants to transform map");
        var variantLollipops = this.addVariantsToTransform(
            variantTransformZoomedOut, "chart-zoomed-out");           
    }

    drawZoomedInChart(svgZoomedIn) {
        // clear out previous transforms containing visualizations on the svg handle
        svgZoomedIn.selectAll("g").remove();

        // initialize svg object and transforms for zoomed out chart
        var yGapBetweenExonsAndVariants = 5;
        var textSize = 10;

        var exonTransformZoomedIn = this.addTransformToSvg(
            svgZoomedIn, this.chartMargin.left, this.chartMargin.top);

        var variantTransformZoomedIn = this.addTransformToSvg(
            svgZoomedIn, this.chartMargin.left, 
            (this.chartMargin.top + this.exonBar.codingHeight + yGapBetweenExonsAndVariants));

        this.setVariantTransformZoomedIn(variantTransformZoomedIn);

        var textTransformZoomedIn = this.addTransformToSvg(
            svgZoomedIn, this.chartMargin.left, this.chartMargin.top / 2);
        
        var yAxisTransformZoomedIn = this.addTransformToSvg(
            svgZoomedIn, this.chartMargin.left / 4, 
            (this.chartMargin.top + this.exonBar.codingHeight + yGapBetweenExonsAndVariants));

        this.setYAxisTransformZoomedIn(yAxisTransformZoomedIn);

        // render exons and introns in the exon transform handle for zoomed in chart
        var hoveredExon = this.gene.getExons()[this.getHoveredExonIndex()];
        var exonBars = this.addZoomedInExonToTransform(exonTransformZoomedIn, hoveredExon);
        var nonCodingExonBars = 
            this.addZoomedInNonCodingExonPartitionsToTransform(exonTransformZoomedIn, hoveredExon);
    
        var intronLines = this.addZoomedInIntronsToTransform(exonTransformZoomedIn, hoveredExon);
        var basePairsOutsideExonLimitText 
            = this.addZoomedInBasePairOutsideExonLimitTextToTransform(
                textTransformZoomedIn, hoveredExon, textSize);
        
        // filter variants by the hovered over exon and render them for the zoomed in chart
        var variantLollipops = this.addVariantsToTransform(
            variantTransformZoomedIn, "chart-zoomed-in");

        // render y axis scale labels 
        var yAxisLabel = this.addZoomedInYAxisLabelToTransform(yAxisTransformZoomedIn);
    }

    addZoomedInYAxisLabelToTransform(chartTransform) {
        // clear the previous y axis label and tick marks
        chartTransform.selectAll("g").remove();

        var yAxisVariableString = this.yAxisVariableString
        var height = this.getChartHeight();
        var variantList = this.gene.getVariantList();
        var yAxisVariableString = this.yAxisVariableString;
        var scaleYAxis = this.getYAxisScale(
            yAxisVariableString, variantList, this.getChartHeight());

        var yAxisTextLabel = chartTransform.append("g").append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", - 10)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .text(yAxisVariableString);
        
        var yAxis = chartTransform.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(" + 
                (this.chartMargin.left / 2) + "," + 0 + ")")
            .call(d3.axisLeft(scaleYAxis));
        
        return yAxisTextLabel;
    }

    addZoomedInExonToTransform(chartTransform, hoveredExon) {
        var exonLength = hoveredExon.getLength();
        var scaleSingleExonToChart 
            = this.getScaleSingleExonToChart(exonLength); 
        var basePairsOutsideExonLimit = this.gene.getBasePairsOutsideExonLimit();
        var exonBarColor = this.exonBar.color;
        var codingHeight = this.exonBar.codingHeight;

        var zoomBar = chartTransform.append("g")
            .selectAll("g")
            .data([ exonLength ])
            .enter().append("g")
            .attr("transform", function(d) { 
                return "translate(" + 
                scaleSingleExonToChart(
                    basePairsOutsideExonLimit
                ) + "," + 0 + ")";
            });

        zoomBar.append("rect")
            .attr("fill", exonBarColor)
            .attr("width", scaleSingleExonToChart)
            .attr("height", function(d) {
                return codingHeight;
            });       
            
        return zoomBar;
    }

    getZoomedInIntronCoordinates(hoveredExon) {
        var zoomLineCoordinates = [];
        var nonCodingHeight = this.exonBar.nonCodingHeight;
        var basePairsOutsideExonLimit = this.gene.getBasePairsOutsideExonLimit();
        var scaleSingleExonToChart 
            = this.getScaleSingleExonToChart(hoveredExon.getLength()); 
        var width = this.getChartWidth();

        zoomLineCoordinates.push(
            [
                [0, 0], 
                [0, nonCodingHeight], 
                [scaleSingleExonToChart(basePairsOutsideExonLimit), nonCodingHeight]
            ],
            [
                [width, 0], 
                [width, nonCodingHeight], 
                [width - scaleSingleExonToChart(basePairsOutsideExonLimit), nonCodingHeight]
            ]);
        return zoomLineCoordinates;
    }

    addZoomedInIntronsToTransform(chartTransform, hoveredExon) {
        var zoomLineCoordinates = this.getZoomedInIntronCoordinates(hoveredExon);
        var zoomLine = chartTransform.append("g")
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

    // draw text labeling the basePairsOutsideExonLimit on top of the intron lines
    addZoomedInBasePairOutsideExonLimitTextToTransform(chartTransform, hoveredExon, textSize) {
        var basePairsOutsideExonLimit = this.gene.getBasePairsOutsideExonLimit();
        var zoomLineCoordinates = this.getZoomedInIntronCoordinates(hoveredExon);

        var text = chartTransform.selectAll("text")
            .data(zoomLineCoordinates)
            .enter().append("text")
            .attr("x", function(d, i) { 
              return d[0][0]; 
            })
            .attr("y", textSize)
            .text(basePairsOutsideExonLimit + " bp")
            .attr("font-family", "sans-serif")
            .attr("font-size", textSize + "px");
      
        return text;
    }

    // Have to display the exon and its variants up to basePairsOutsideExonLimit
    // so account for padding consisting of 2 * basePairsOutsideExonLimit
    getScaleSingleExonToChart(exonLength) {
        var exonLengthPlusPadding = exonLength
            + (2 * this.gene.getBasePairsOutsideExonLimit());

        var scaleSingleExonToChart = d3.scaleLinear()
          .domain([ 0, exonLengthPlusPadding ])
          .range([ 0, this.getChartWidth() ]);   

        return scaleSingleExonToChart;
    }

    addZoomedOutExonsToTransform(chartTransform) {
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

        this.highlightHoveredExon(bar, exonBar.color, exons);

        return bar;
    }

    addZoomedOutIntronsToTransform(chartTransform) {
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
                    scaleUniformIntronsToChart(
                        intronPartitionsWithUniformIntronLength[i].getStart()), 
                    nonCodingHeight
                ],
                [
                    scaleUniformIntronsToChart(
                        intronPartitionsWithUniformIntronLength[i].getEnd()), 
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

    addZoomedInNonCodingExonPartitionsToTransform(chartTransform, hoveredExon) {
        var hoveredExonIndex = this.getHoveredExonIndex();
        var nonCodingExonIndices = this.gene.getNonCodingExonIndices();
        var basePairsOutsideExonLimit = this.gene.getBasePairsOutsideExonLimit();
        var scaleSingleExonToChart = 
            this.getScaleSingleExonToChart(hoveredExon.getLength());
        var barHeightCoding = this.exonBar.codingHeight;
        var barHeightNonCoding = this.exonBar.nonCodingHeight;
        var nonCodingExonBar = null;
        var exonNonPartitionLength = 0;     
        var nonCodingXPositionStart = 0;

        if (nonCodingExonIndices.includes(hoveredExonIndex)) {
            console.log("nonCodingExonIndices hovered over!");

            // case with first exon containing non coding partition
            if (hoveredExonIndex == nonCodingExonIndices[0]) {
                exonNonPartitionLength = this.gene.cdsStart - hoveredExon.getStart();
                nonCodingXPositionStart = 
                    scaleSingleExonToChart(basePairsOutsideExonLimit);      
            }
            // case with last exon containing non coding partition
            else if (hoveredExonIndex == nonCodingExonIndices[1]) {
                exonNonPartitionLength = hoveredExon.getEnd() - this.gene.cdsEnd;
                nonCodingXPositionStart = this.getChartWidth() - scaleSingleExonToChart(
                    exonNonPartitionLength + basePairsOutsideExonLimit);
            }

            nonCodingExonBar = chartTransform.append("g")
                .selectAll(".rectNonCodingZoomedIn")
                .data([exonNonPartitionLength, exonNonPartitionLength])
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
        }
        return nonCodingExonBar;
    }

    // add white rectangles to the non-coding area in the 
    // first exon that occurs before cdsStart and the non-coding area in the
    // last exon that occurs after cdsEnd, thereby distinguishing the height
    // of the non-coding area with the coding area of those exons
    addZoomedOutNonCodingExonPartitionsToTransform(chartTransform) {
        var nonCodingExonPartitions = this.gene.getNonCodingExonPartitions();
        var scaleOriginalIntronsToUniformIntrons 
            = this.gene.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        var codingHeight = this.exonBar.codingHeight;
        var nonCodingHeight = this.exonBar.nonCodingHeight;

        // need to add white rectangles to the top and bottom of the first and last exons,
        // so duplicate the exon start positions and the exon lengths
        var nonCodingExonPartitionStarts = this.gene.getExonStarts(nonCodingExonPartitions);
        var xPositionStarts 
            = nonCodingExonPartitionStarts.concat(nonCodingExonPartitionStarts);
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

    scaleOriginalIntronsToChart(basePairPosition) {
        var scaleOriginalIntronsToUniformIntrons = 
            this.gene.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();
        
        return (scaleUniformIntronsToChart(
            scaleOriginalIntronsToUniformIntrons(basePairPosition)
        ));
    }

    addVariantsToTransform(chartTransform, chartName) {
        var chartController = this;
        var variantList = this.gene.getVariantList();
        var variantMap = this.gene.getVariantMap();
        var yAxisVariableString = this.yAxisVariableString;
        var scaleVariantFlagToLollipopColor = this.getScaleVariantFlagToLollipopColor();
        var scaleYAxis = this.getYAxisScale(
            yAxisVariableString, variantList, this.getChartHeight());

        var scaleOriginalIntronsToUniformIntrons = 
            this.gene.getScaleOriginalIntronsToUniformIntrons();
        var scaleUniformIntronsToChart = this.getScaleUniformIntronsToChart();

        var hoveredExon = null; 
        var hoveredExonIndex = null;
        var hoveredExonStarts = null;
        var hoveredExonEnds = null;
        var scaleSingleExonToChart = null;
        var basePairsOutsideExonLimit = this.gene.getBasePairsOutsideExonLimit();

        if (chartName == "chart-zoomed-in") {
            hoveredExonIndex = this.getHoveredExonIndex();;
            hoveredExon = this.gene.getExons()[hoveredExonIndex];
            hoveredExonStarts = hoveredExon.getStart();
            hoveredExonEnds = hoveredExon.getEnd();
            scaleSingleExonToChart = this.getScaleSingleExonToChart(hoveredExon.getLength());
            variantMap = this.gene.getFilteredVariantMap(
                hoveredExonStarts, hoveredExonEnds, hoveredExonIndex);
            variantList = this.gene.getFilteredVariantList(
                hoveredExonStarts, hoveredExonEnds, hoveredExonIndex);
        }

        // clear the previous variant visualization
        chartTransform.selectAll("g").remove();

        var lollipopRect = chartTransform.selectAll("g")
            .data(variantList)
            .enter().append("g")
            .attr("transform", function (d) {
                if (chartName == "chart-zoomed-out") {
                    return "translate(" +
                        chartController.scaleOriginalIntronsToChart(d.position) 
                            + "," + 0 + ")";
                }    
                else if (chartName == "chart-zoomed-in") {
                    return "translate(" + scaleSingleExonToChart(
                        d.position - hoveredExonStarts + basePairsOutsideExonLimit
                    ) + "," + 0 + ")";
                }         
            })
            .append("rect")
            .attr("width", this.variantLollipop.width)
            .attr("height", function (d) {
                return scaleYAxis(
                    getYAxisVariableValueFromMap(yAxisVariableString, variantMap, d));
            })
            .attr('fill', function (d) {
                return scaleVariantFlagToLollipopColor(d.annotation);
            });

        var lollipopCircle = chartTransform.selectAll('circle')
            .data(variantList)
            .enter().append("g").append('circle')
            .attr('cx', function (d) {
                if (chartName == "chart-zoomed-out") {
                    return chartController.scaleOriginalIntronsToChart(d.position);
                }
                else if (chartName == "chart-zoomed-in") {
                    return scaleSingleExonToChart(
                        d.position - hoveredExonStarts + basePairsOutsideExonLimit);
                }         
            })
            .attr('cy', function (d) {
                return scaleYAxis(
                    getYAxisVariableValueFromMap(yAxisVariableString, variantMap, d));
            })
            .attr('r', this.variantLollipop.radius)
            .attr('fill', function (d) {
                return scaleVariantFlagToLollipopColor(d.annotation);
            });
            
        this.addVariantDataToTooltip(lollipopCircle, variantMap);

        return lollipopCircle;
    }

    addVariantDataToTooltip(lollipopCircle, variantMap) {
        // When hovering over a circle, open a tooltip displaying variant data
        var tooltip = this.getTooltip();
        lollipopCircle.on("mouseover", function(d, i) {   
            tooltip.transition()    
                .duration(200)    
                .style("opacity", .9); 

            // TODO: If there is more that one varianåt in a position, we need to show a table
            // of variants when clicking or hovering over that lollipop circle.
            // For now if a position has multiple variants, the tooltip shows the first variant
            tooltip.html("chromosome: " + variantMap[d.position][0].chrom + "<br/>"
            + "position: " + variantMap[d.position][0].position + "<br/>"
            + "referenceAllele: " + variantMap[d.position][0].reference + "<br/>"
            + "alternateAllele: " + variantMap[d.position][0].alternate + "<br/>"
            + "annotation: " + variantMap[d.position][0].annotation + "<br/>"
            + "alleleCount: " + variantMap[d.position][0].allelecount + "<br/>"
            + "alleleNumber: " + variantMap[d.position][0].allelenumber + "<br/>"
            + "alleleFrequency: " + variantMap[d.position][0].allelefrequency + "<br/>"
            + "number of variants: " + variantMap[d.position].length)
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 50) + "px");  
        })          
        .on("mouseout", function(d) {   
            tooltip.transition()    
                .duration(500)    
                .style("opacity", 0);
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

    getYAxisScale(yAxisVariableString, variantData, height) {
        var yScaleMin = 0;
        var yScaleMax = 0;
        var yScaleMinExponent = 0;
        var yAxisScale = 0;
      
        if (yAxisVariableString == 'MAF') {
            // Get the exponential level of the minimum value, and set yScaleMin to 1 * 10^(exponent)
            // So if min = 2.05 * 10^(-6), then yScaleMin = 1 * 10^(-6)
            // Default y axis variable is allele frequency
            yScaleMin = d3.min(variantData, function(d) { return d.allelefrequency; });
            yScaleMinExponent = Math.floor( Math.log(yScaleMin) / Math.log(10) );
            yScaleMin = Math.pow(10, yScaleMinExponent);
        
            yAxisScale = d3.scaleLog()
                .domain([ yScaleMin, 1 ])
                .range([ 0, height ]);
        }
        else if (yAxisVariableString == 'alleleNumber') {
            yScaleMin = d3.min(variantData, function(d) { return d.allelenumber; });
            yScaleMax = d3.max(variantData, function(d) { return d.allelenumber; });
        
            yAxisScale = d3.scaleLinear()
                .domain([ yScaleMin, yScaleMax ])
                .range([ 0, height ]);
        }
        else if (yAxisVariableString == 'alleleCount') {
            yScaleMin = d3.min(variantData, function(d) { return d.allelecount; });
            yScaleMax = d3.max(variantData, function(d) { return d.allelecount; });
         
            yAxisScale = d3.scaleLog()
              .domain([ yScaleMin, yScaleMax ])
              .range([ 0, height ]);
        }
        
        return yAxisScale;
    }

    highlightHoveredExon(exonBars, defaultExonBarColor, exons) {
        var hoveredExonIndex = -1;
        var previousHoveredExonIndex = -1;
        var exonSelector = exonBars._groups[0];
        var chartController = this;

        // later I should do a separate function for initializing 
        // handles for svg objects and transform objects
        // and later just call them using getters and setters 
        console.log("initialize svg object for zoomed in chart");
        var svgZoomedIn = chartController.addSvgToDiv(".chart-zoomed-in");
    
        exonBars.on("mouseover", function(d, i) {
            previousHoveredExonIndex = chartController.getHoveredExonIndex();
            hoveredExonIndex = i;

            d3.select(exonSelector[previousHoveredExonIndex])
                .select("rect").attr("fill", defaultExonBarColor);
            d3.select(exonSelector[hoveredExonIndex])
                .select("rect").attr("fill", "lightgreen");
            
            chartController.setHoveredExonIndex(hoveredExonIndex);

            console.log("chartController draw zoomed in chart");
            chartController.drawZoomedInChart(svgZoomedIn);
        });
    }
}

// This function is outside of the ChartController class because 
// the anonymous function that calls it cannot use "this.getYAxisVariableValueFromMap"
// because in the scope of the anonymous function, "this" does not refer to the
// ChartController object. Workaround is to store chartController as a variable
// in the function that calls it.
function getYAxisVariableValueFromMap(yAxisVariableString, variantMap, variant) {
    if (yAxisVariableString == 'MAF') {
        return variantMap[variant.position][0].allelefrequency;
    }
    else if (yAxisVariableString == 'alleleNumber') {
        return variantMap[variant.position][0].allelenumber;
    }
    else if (yAxisVariableString == 'alleleCount') {
        return variantMap[variant.position][0].allelecount;
    }
}

function changeYAxisVariable(chartController, newYAxisVariable) {
    chartController.setYAxisVariableString(newYAxisVariable);
    console.log("newYAxisVariable");
    console.log(chartController.yAxisVariableString);

    var variantTransformZoomedOut = chartController.getVariantTransformZoomedOut();
    var variantTransformZoomedIn = chartController.getVariantTransformZoomedIn();
    var yAxisTransformZoomedIn = chartController.getYAxisTransformZoomedIn();
    
    // redraw the zoomed out view chart (top) and zoomed in view chart (bottom)
    chartController.addVariantsToTransform(variantTransformZoomedOut, "chart-zoomed-out");
    chartController.addVariantsToTransform(variantTransformZoomedIn, "chart-zoomed-in");
    chartController.addZoomedInYAxisLabelToTransform(yAxisTransformZoomedIn);
}