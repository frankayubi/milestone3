// src/components/charts/PieChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createSvgContainer, createTooltip } from '../../utils/d3Utils';

function PieChartComponent({ data }) {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !data.length) return;
    
    // Create SVG container
    const { svg, g, width, height } = createSvgContainer(
      svgRef, 
      { top: 10, right: 10, bottom: 10, left: 10 }
    );
    
    // Calculate radius
    const radius = Math.min(width, height) / 2 - 60;
    
    // Move center point to middle of chart area
    g.attr("transform", `translate(${width / 2 - 30}, ${height / 2})`);
    
    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);
    
    // Generate arc path data
    const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);
    
    // Create outer arc for labels
    const outerArc = d3.arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create pie chart segments
    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");
    
    // Add paths for each segment with transition
    arcs.append("path")
      .attr("d", arcGenerator)
      .attr("fill", d => d.data.fill || "#ccc")
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`${d.data.name}: ${d.data.value} (${(d.value / d3.sum(data, d => d.value) * 100).toFixed(1)}%)`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // Highlight segment
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius * 1.05)
          );
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        // Reset segment
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .attr("d", arcGenerator);
      })
      .transition()
      .duration(1000)
      .attrTween("d", function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arcGenerator(interpolate(t));
        };
      });
    
    // Add labels with polylines
    arcs.each(function(d) {
      // Skip small segments for labels (less than 5% of total)
      if (d.value / d3.sum(data, d => d.value) < 0.05) return;
      
      const pos = outerArc.centroid(d);
      const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      pos[0] = radius * 1.2 * (midAngle < Math.PI ? 1 : -1);
      
      const arcCentroid = arcGenerator.centroid(d);
      const outerArcCentroid = outerArc.centroid(d);
      
      // Add polyline between segment and label
      g.append("polyline")
        .attr("points", `${arcCentroid}, ${outerArcCentroid}, ${pos}`)
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-width", "1px")
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 0.5);
      
      // Add text label
      g.append("text")
        .attr("dy", ".35em")
        .attr("x", pos[0])
        .attr("y", pos[1])
        .style("text-anchor", midAngle < Math.PI ? "start" : "end")
        .style("font-size", "12px")
        .text(d.data.name.split(' ')[0]) // First word only to avoid overlaps
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
    });
    
  }, [data]);
  
  return (
    <svg ref={svgRef} width="100%" height="300"></svg>
  );
}

export default PieChartComponent;