function addTooltip() {
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("font-size", 10);
  
    return tooltip;
  }
  