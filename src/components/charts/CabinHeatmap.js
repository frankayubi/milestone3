// src/components/charts/CabinHeatmap.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createSvgContainer, createTooltip } from '../../utils/d3Utils';

function CabinHeatmapComponent({ data }) {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !data.length) return;
    
    // Process data to get unique cabins and statuses
    const cabins = Array.from(new Set(data.map(d => d.cabin)));
    const statuses = Array.from(new Set(data.map(d => d.status)));
    
    // Create a lookup for our data
    const dataLookup = {};
    data.forEach(d => {
      dataLookup[`${d.cabin}-${d.status}`] = d;
    });
    
    // Calculate survival rates for each cabin
    const cabinStats = cabins.map(cabin => {
      const survivedData = dataLookup[`${cabin}-Survived`] || { count: 0 };
      const diedData = dataLookup[`${cabin}-Died`] || { count: 0 };
      
      const survived = survivedData.count || 0;
      const died = diedData.count || 0;
      const total = survived + died;
      const rate = total ? ((survived / total) * 100).toFixed(1) : '0';
      
      return { cabin, survived, died, total, rate };
    }).filter(item => item.total > 0);
    
    // Sort by survival rate for better visualization
    cabinStats.sort((a, b) => b.rate - a.rate);
    
    // Create SVG container with custom margins for table layout
    const { svg, g, width, innerWidth, innerHeight } = createSvgContainer(
      svgRef, 
      { top: 40, right: 20, bottom: 20, left: 80 }
    );
    
    // Set up cell dimensions
    const cellHeight = 30;
    const cellPadding = 2;
    const effectiveHeight = cabinStats.length * cellHeight;
    
    // Create scales
    const y = d3.scaleBand()
      .domain(cabinStats.map(d => d.cabin))
      .range([0, effectiveHeight])
      .padding(0.05);
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create table header
    const header = svg.append("g")
      .attr("class", "heatmap-header")
      .attr("transform", `translate(80, 20)`);
    
    header.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text("Cabin")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    
    header.append("text")
      .attr("x", 70)
      .attr("y", 0)
      .text("Survived")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    
    header.append("text")
      .attr("x", 140)
      .attr("y", 0)
      .text("Died")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    
    header.append("text")
      .attr("x", 210)
      .attr("y", 0)
      .text("Survival Rate")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    
    // Create table rows
    const rows = g.selectAll(".cabin-row")
      .data(cabinStats)
      .enter()
      .append("g")
      .attr("class", "cabin-row")
      .attr("transform", d => `translate(0, ${y(d.cabin)})`);
    
    // Add cabin labels
    rows.append("text")
      .attr("x", -10)
      .attr("y", cellHeight / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text(d => d.cabin)
      .style("font-size", "12px");
    
    // Add survived counts
    rows.append("text")
      .attr("x", 70)
      .attr("y", cellHeight / 2)
      .attr("dominant-baseline", "middle")
      .text(d => d.survived)
      .style("font-size", "12px");
    
    // Add died counts
    rows.append("text")
      .attr("x", 140)
      .attr("y", cellHeight / 2)
      .attr("dominant-baseline", "middle")
      .text(d => d.died)
      .style("font-size", "12px");
    
    // Add survival rate heatmap cells
    rows.append("rect")
      .attr("x", 210)
      .attr("y", cellPadding)
      .attr("width", 100)
      .attr("height", cellHeight - 2 * cellPadding)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", d => {
        // Calculate color based on survival rate
        const rate = parseFloat(d.rate);
        return d3.interpolateRgb(
          "rgb(255, 50, 50)",
          "rgb(50, 255, 50)"
        )(rate / 100);
      })
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          <strong>Cabin ${d.cabin}</strong><br>
          Survived: ${d.survived}<br>
          Died: ${d.died}<br>
          Survival Rate: ${d.rate}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // Highlight cell
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "#333")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        // Reset cell
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "none");
      });
    
    // Add survival rate text
    rows.append("text")
      .attr("x", 260)
      .attr("y", cellHeight / 2)
      .attr("dominant-baseline", "middle")
      .text(d => `${d.rate}%`)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", d => {
        const rate = parseFloat(d.rate);
        return rate > 50 ? "#000" : "#fff";
      });
    
    // Add color scale legend
    const legendWidth = 200;
    const legendHeight = 15;
    
    const legendX = width - legendWidth - 20;
    const legendY = 20;
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);
    
    // Create linear gradient for the legend
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
      .attr("id", "survival-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgb(255, 50, 50)");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgb(50, 255, 50)");
    
    // Add the colored rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#survival-gradient)")
      .attr("rx", 3)
      .attr("ry", 3);
    
    // Add labels
    legend.append("text")
      .attr("x", 0)
      .attr("y", -5)
      .text("0%")
      .style("font-size", "10px")
      .style("text-anchor", "start");
    
    legend.append("text")
      .attr("x", legendWidth)
      .attr("y", -5)
      .text("100%")
      .style("font-size", "10px")
      .style("text-anchor", "end");
    
    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -5)
      .text("Survival Rate")
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .style("font-weight", "bold");
    
  }, [data]);
  
  return (
    <div className="heatmap">
      <svg ref={svgRef} width="100%" height="300"></svg>
    </div>
  );
}

export default CabinHeatmapComponent;