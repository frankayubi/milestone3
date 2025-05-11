// src/components/charts/BarChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createSvgContainer, addGrid, addAxes, createTooltip, addLegend } from '../../utils/d3Utils';

function BarChartComponent({ data, colors }) {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !data.length) return;
    
    // Create SVG container
    const { svg, g, innerWidth, innerHeight } = createSvgContainer(svgRef);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.gender))
      .range([0, innerWidth])
      .padding(0.3);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.survived, d.died))])
      .nice()
      .range([innerHeight, 0]);
    
    // Add grid
    addGrid(g, x, y, innerWidth, innerHeight);
    
    // Add axes
    addAxes(g, x, y, innerWidth, innerHeight);
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create grouped bars
    const barWidth = x.bandwidth() / 2;
    
    // Add bars for survived
    g.selectAll(".bar-survived")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-survived")
      .attr("x", d => x(d.gender))
      .attr("width", barWidth)
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", colors[1])
      .attr("rx", 2)
      .on("mouseover", function(event, d) {
        // Use the data bound to this specific element
        const dataItem = d3.select(this).datum();
        
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`${dataItem.gender}<br>Survived: ${dataItem.survived}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.survived))
      .attr("height", d => innerHeight - y(d.survived));
    
    // Add bars for died
    g.selectAll(".bar-died")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-died")
      .attr("x", d => x(d.gender) + barWidth)
      .attr("width", barWidth)
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", colors[0])
      .attr("rx", 2)
      .on("mouseover", function(event, d) {
        // Use the data bound to this specific element
        const dataItem = d3.select(this).datum();
        
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`${dataItem.gender}<br>Did Not Survive: ${dataItem.died}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.died))
      .attr("height", d => innerHeight - y(d.died));
    
    // Add legend
    addLegend(svg, [
      { label: 'Survived', color: colors[1], shape: 'rect' },
      { label: 'Did Not Survive', color: colors[0], shape: 'rect' }
    ], { x: innerWidth - 150, y: 20 });
    
  }, [data, colors]);
  
  return (
    <svg ref={svgRef} width="100%" height="300"></svg>
  );
}

export default BarChartComponent;