// src/components/charts/ScatterPlot.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createSvgContainer, addGrid, addAxes, createTooltip, addLegend } from '../../utils/d3Utils';

function ScatterPlotComponent({ data, colors }) {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !data.length) return;
    
    // Create SVG container
    const { svg, g, width, innerWidth, innerHeight } = createSvgContainer(
      svgRef, 
      { top: 20, right: 60, bottom: 50, left: 60 }
    );
    
    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.age) + 5])
      .nice()
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 200]) // Cap fare at 200 for better visualization
      .nice()
      .range([innerHeight, 0]);
    
    const r = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.familySize)])
      .range([4, 15]);
    
    // Add grid
    addGrid(g, x, y, innerWidth, innerHeight);
    
    // Add axes
    addAxes(g, x, y, innerWidth, innerHeight, "Age (years)", "Fare ($)");
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Add data points
    g.selectAll(".data-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => x(d.age))
      .attr("cy", d => y(d.fare))
      .attr("r", 0) // Start with radius 0 for animation
      .attr("fill", d => colors[d.survived])
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          <strong>${d.name}</strong><br>
          Age: ${d.age}<br>
          Fare: $${d.fare.toFixed(2)}<br>
          Class: ${d.class}<br>
          Family Size: ${d.familySize}<br>
          Status: ${d.survived ? 'Survived' : 'Did Not Survive'}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // Highlight point
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 2)
          .attr("stroke", "#333");
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        
        // Reset point
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.7)
          .attr("stroke-width", 1)
          .attr("stroke", "#fff");
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 3)
      .attr("r", d => r(d.familySize));
    
    // Add legend
    addLegend(svg, [
      { label: 'Survived', color: colors[1], shape: 'circle' },
      { label: 'Did Not Survive', color: colors[0], shape: 'circle' }
    ], { x: innerWidth + 30, y: 20 });
    
    // Add family size legend
    const sizeLegend = svg.append("g")
      .attr("transform", `translate(${innerWidth + 30}, 80)`);
    
    sizeLegend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text("Family Size")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#2c3e50");
    
    [1, 3, 5].forEach((size, i) => {
      const legendItem = sizeLegend.append("g")
        .attr("transform", `translate(0, ${i * 25 + 20})`);
      
      legendItem.append("circle")
        .attr("r", r(size))
        .attr("cx", 10)
        .attr("cy", 0)
        .attr("fill", "#666")
        .attr("opacity", 0.6);
      
      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 5)
        .text(size)
        .style("font-size", "12px")
        .style("fill", "#2c3e50");
    });
    
    // Add brush for zoom functionality
    const brush = d3.brush()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", brushEnded);
    
    g.append("g")
      .attr("class", "brush")
      .call(brush);
    
    function brushEnded(event) {
      const selection = event.selection;
      if (!selection) return;
      
      // Get the selected domain values
      const [[x1, y1], [x2, y2]] = selection;
      const newXDomain = [x.invert(x1), x.invert(x2)];
      const newYDomain = [y.invert(y2), y.invert(y1)]; // Y is inverted
      
      // Update scales
      x.domain(newXDomain);
      y.domain(newYDomain);
      
      // Update grid and axes
      g.select(".x-grid").remove();
      g.select(".y-grid").remove();
      g.select(".x-axis").remove();
      g.select(".y-axis").remove();
      
      addGrid(g, x, y, innerWidth, innerHeight);
      addAxes(g, x, y, innerWidth, innerHeight, "Age (years)", "Fare ($)");
      
      // Update circles
      g.selectAll(".data-point")
        .transition()
        .duration(750)
        .attr("cx", d => x(d.age))
        .attr("cy", d => y(d.fare));
      
      // Remove brush
      g.select(".brush").call(brush.move, null);
    }
    
    // Add reset zoom button
    svg.append("text")
      .attr("x", innerWidth - 50)
      .attr("y", 20)
      .attr("class", "reset-zoom")
      .text("Reset Zoom")
      .style("font-size", "12px")
      .style("cursor", "pointer")
      .style("fill", "#3498db")
      .style("text-decoration", "underline")
      .on("click", function() {
        // Reset domain
        x.domain([0, d3.max(data, d => d.age) + 5]).nice();
        y.domain([0, 200]).nice();
        
        // Update grid and axes
        g.select(".x-grid").remove();
        g.select(".y-grid").remove();
        g.select(".x-axis").remove();
        g.select(".y-axis").remove();
        
        addGrid(g, x, y, innerWidth, innerHeight);
        addAxes(g, x, y, innerWidth, innerHeight, "Age (years)", "Fare ($)");
        
        // Update circles
        g.selectAll(".data-point")
          .transition()
          .duration(750)
          .attr("cx", d => x(d.age))
          .attr("cy", d => y(d.fare));
      });
    
  }, [data, colors]);
  
  return (
    <svg ref={svgRef} width="100%" height="300"></svg>
  );
}

export default ScatterPlotComponent;