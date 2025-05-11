// src/components/charts/FareHistogram.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createSvgContainer, addGrid, addAxes, createTooltip, addLegend } from '../../utils/d3Utils';

function FareHistogramComponent({ data, colors }) {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !data.length) return;
    
    // Create SVG container
    const { svg, g, innerWidth, innerHeight } = createSvgContainer(svgRef);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.range))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([innerHeight, 0]);
    
    // Add grid
    addGrid(g, x, y, innerWidth, innerHeight);
    
    // Add axes
    addAxes(g, x, y, innerWidth, innerHeight, "Fare Range ($)", "Passenger Count");
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create bars for total count
    g.selectAll(".bar-total")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-total")
      .attr("x", d => x(d.range))
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)  // Start from bottom
      .attr("height", 0)       // Initial height is 0
      .attr("fill", "#8884d8")
      .attr("rx", 2)           // Rounded corners
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          Fare: $${d.range}<br>
          Total: ${d.count} passengers<br>
          Survived: ${d.survived} (${(d.survived / d.count * 100).toFixed(1)}%)
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // Highlight bar
        d3.select(this).transition()
          .duration(200)
          .attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        // Reset bar
        d3.select(this).transition()
          .duration(200)
          .attr("opacity", 1);
      })
      .transition()
      .duration(1000)
      .attr("y", d => y(d.count))
      .attr("height", d => innerHeight - y(d.count));
    
    // Create bars for survived count
    g.selectAll(".bar-survived")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-survived")
      .attr("x", d => x(d.range))
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)  // Start from bottom
      .attr("height", 0)       // Initial height is 0
      .attr("fill", colors[1])
      .attr("rx", 2)           // Rounded corners
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          Fare: $${d.range}<br>
          Survived: ${d.survived} of ${d.count} (${(d.survived / d.count * 100).toFixed(1)}%)
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // Highlight bar
        d3.select(this).transition()
          .duration(200)
          .attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        // Reset bar
        d3.select(this).transition()
          .duration(200)
          .attr("opacity", 1);
      })
      .transition()
      .duration(1000)
      .delay(500)  // Delay to show after total bars
      .attr("y", d => y(d.survived))
      .attr("height", d => innerHeight - y(d.survived));
    
    // Add legend
    addLegend(svg, [
      { label: 'Total', color: '#8884d8', shape: 'rect' },
      { label: 'Survived', color: colors[1], shape: 'rect' }
    ], { x: innerWidth - 150, y: 20 });
    
  }, [data, colors]);
  
  return (
    <svg ref={svgRef} width="100%" height="300"></svg>
  );
}

export default FareHistogramComponent;