// src/utils/d3Utils.js
import * as d3 from 'd3';

// Create responsive SVG container
export function createSvgContainer(svgRef, margin = { top: 20, right: 30, bottom: 40, left: 50 }) {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();
  
  const width = svg.node().getBoundingClientRect().width;
  const height = parseInt(svg.attr("height") || 300);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
  return { svg, g, width, height, innerWidth, innerHeight };
}

// Add tooltip functionality
export function createTooltip() {
  // Remove any existing tooltip first
  d3.select('.d3-tooltip').remove();
  
  return d3.select('body').append('div')
    .attr('class', 'd3-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', 'rgba(255, 255, 255, 0.95)')
    .style('border', '1px solid #ddd')
    .style('border-radius', '6px')
    .style('padding', '12px')
    .style('box-shadow', '0 5px 10px rgba(0, 0, 0, 0.1)')
    .style('pointer-events', 'none')
    .style('font-size', '13px')
    .style('z-index', '1000');
}

// Add grid lines
export function addGrid(g, x, y, innerWidth, innerHeight) {
  // Add X grid
  g.append("g")
    .attr("class", "grid x-grid")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x)
      .tickSize(-innerHeight)
      .tickFormat("")
    )
    .select(".domain")
    .remove();
  
  // Add Y grid
  g.append("g")
    .attr("class", "grid y-grid")
    .call(d3.axisLeft(y)
      .tickSize(-innerWidth)
      .tickFormat("")
    )
    .select(".domain")
    .remove();
  
  // Style grid lines
  g.selectAll(".grid line")
    .style("stroke", "#e0e0e0")
    .style("stroke-opacity", 0.7)
    .style("shape-rendering", "crispEdges");
}

// Add axes
export function addAxes(g, x, y, innerWidth, innerHeight, xLabel, yLabel) {
  // Add X axis
  const xAxis = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));
  
  if (xLabel) {
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "#2c3e50")
      .style("text-anchor", "middle")
      .text(xLabel);
  }
  
  // Add Y axis
  const yAxis = g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
  
  if (yLabel) {
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#2c3e50")
      .style("text-anchor", "middle")
      .text(yLabel);
  }
}

// Add legend
export function addLegend(svg, items, { x = 0, y = 0, itemHeight = 20 } = {}) {
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${x}, ${y})`);
  
  items.forEach((item, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${i * itemHeight})`);
    
    if (item.shape === 'rect') {
      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);
    } else {
      g.append("circle")
        .attr("r", 7)
        .attr("cx", 7)
        .attr("cy", 7)
        .attr("fill", item.color);
    }
    
    g.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(item.label)
      .style("font-size", "12px")
      .style("fill", "#2c3e50");
  });
  
  return legend;
}