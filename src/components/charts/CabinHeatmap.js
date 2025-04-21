// src/components/charts/CabinHeatmap.js
import React from 'react';

function CabinHeatmapComponent({ data }) {
  // Transform data for the heatmap
  const cabins = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'T', 'Unknown'];
  
  // Process data for the table format
  const tableData = cabins.map(cabin => {
    const survivedData = data.find(d => d.cabin === cabin && d.status === 'Survived');
    const diedData = data.find(d => d.cabin === cabin && d.status === 'Died');
    
    const survived = survivedData ? survivedData.count : 0;
    const died = diedData ? diedData.count : 0;
    const total = survived + died;
    const rate = total ? ((survived / total) * 100).toFixed(1) : '0';
    
    return { cabin, survived, died, total, rate };
  }).filter(item => item.total > 0);

  return (
    <div className="heatmap">
      <table className="heatmap-table">
        <thead>
          <tr>
            <th>Cabin</th>
            <th>Survived</th>
            <th>Died</th>
            <th>Survival Rate</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map(({ cabin, survived, died, total, rate }) => {
            // Calculate color based on survival rate
            const intensity = Math.min(survived / total * 255, 255);
            const bgColor = `rgba(${255 - intensity}, ${intensity}, 100, 0.7)`;
            
            return (
              <tr key={cabin}>
                <td>{cabin}</td>
                <td>{survived}</td>
                <td>{died}</td>
                <td style={{ backgroundColor: bgColor }}>{rate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CabinHeatmapComponent;