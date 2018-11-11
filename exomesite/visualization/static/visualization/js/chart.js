function addTooltip() {
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("font-size", 10);

    return tooltip;
}

function addSvgToDiv(margin, dimension, divName) {
    var svgChartHandle = d3.select(divName).append("svg")
        .attr("width", dimension.width + margin.left + margin.right)
        .attr("height", dimension.height + margin.top + margin.bottom);

    return svgChartHandle;
}