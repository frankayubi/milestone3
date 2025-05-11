// src/components/charts/StackedBarChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createSvgContainer, addGrid, addAxes, createTooltip, addLegend } from '../../utils/d3Utils';

function StackedBarChartComponent({ data }) {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !data.length) return;
    
    // Create SVG container
    const { svg, g, innerWidth, innerHeight } = createSvgContainer(svgRef);
    
    // Set up keys for stacking
    const keys = ['class1', 'class2', 'class3'];
    const colors = ['#8884d8', '#82ca9d', '#ffc658'];
    
    // Prepare data for stacking
    const stackGenerator = d3.stack().keys(keys);
    const stackedData = stackGenerator(data);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.ageGroup))
      .range([0, innerWidth])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
      .nice()
      .range([innerHeight, 0]);
    
    // Add grid
    addGrid(g, x, y, innerWidth, innerHeight);
    
    // Add axes
    addAxes(g, x, y, innerWidth, innerHeight, "Age Group", "Passenger Count");
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create and add the bars
    const groups = g.selectAll(".stack-group")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "stack-group")
      .attr("fill", (d, i) => colors[i]);
    
    groups.selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => x(d.data.ageGroup))
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)  // Start from bottom for animation
      .attr("height", 0)       // Initial height is 0 for animation
      .attr("rx", 2)           // Rounded corners
      .on("mouseover", function(event, d) {
        // Determine which class this is based on the color
        const thisG = d3.select(this.parentNode);
        const index = groups.nodes().indexOf(thisG.node());
        const className = index === 0 ? "1st Class" : index === 1 ? "2nd Class" : "3rd Class";
        const value = d[1] - d[0];
        
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          Age Group: ${d.data.ageGroup}<br>
          ${className}: ${value} passengers
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // Highlight bar
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        // Reset bar
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke", "none");
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]));
    
    // Add legend
    addLegend(svg, [
      { label: '1st Class', color: colors[0], shape: 'rect' },
      { label: '2nd Class', color: colors[1], shape: 'rect' },
      { label: '3rd Class', color: colors[2], shape: 'rect' }
    ], { x: innerWidth - 150, y: 20 });
    
  }, [data]);
  
  return (
    <svg ref={svgRef} width="100%" height="300"></svg>
  );
}

export default StackedBarChartComponent;