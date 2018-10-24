function addLollipopToZoomedOutChart(yAxisVariableString, variantTransform, data, lollipop, OFFSET,
    scaleUniformIntronsToChart, scaleVariableIntronsToUniformIntrons, yScaleLollipop) {
    
    variantTransform.selectAll("g").remove();
  
    var lollipopRect = variantTransform.selectAll("g")
        .data(data)
      .enter().append("g")
        .attr("transform", function(d) {
          return "translate(" + 
            scaleUniformIntronsToChart(
              scaleVariableIntronsToUniformIntrons(d.position - OFFSET)
            ) + "," + 0 + ")";
        })
        .append("rect")
        .attr("width", lollipop.width)
        .attr("height", function(d) {
          if (yAxisVariableString == 'MAF') {
            return yScaleLollipop(variant_map[d.position][0].alleleFrequency);
          }
          else if (yAxisVariableString == 'alleleNumber') {
            return yScaleLollipop(variant_map[d.position][0].alleleNumber);
          }
        })
        .attr('fill', function(d) {
          return variantAnnotationToLollipopColor(d.annotation);
        });
  
      var lollipopCircle = variantTransform.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', function (d) {
          return scaleUniformIntronsToChart(
            scaleVariableIntronsToUniformIntrons(d.position - OFFSET)
          );
        })
        .attr('cy', function (d) {
          if (yAxisVariableString == 'MAF') {
            return yScaleLollipop(variant_map[d.position][0].alleleFrequency);
          }
          else if (yAxisVariableString == 'alleleNumber') {
            return yScaleLollipop(variant_map[d.position][0].alleleNumber);
          }
        })
        .attr('r', lollipop.radius)
        .attr('fill', function (d) {
          return variantAnnotationToLollipopColor(d.annotation);
        });
      
      return lollipopCircle;
  }