// src/components/charts/ScatterPlot.js
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ScatterPlotComponent({ data, colors }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="age" name="Age" />
        <YAxis type="number" dataKey="fare" name="Fare" />
        <ZAxis type="number" dataKey="familySize" range={[40, 200]} name="Family Size" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} 
          content={({ payload }) => {
            if (payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="custom-tooltip">
                  <p>{`Name: ${data.name}`}</p>
                  <p>{`Age: ${data.age}`}</p>
                  <p>{`Fare: $${data.fare}`}</p>
                  <p>{`Class: ${data.class}`}</p>
                  <p>{`Family Size: ${data.familySize}`}</p>
                  <p>{`Status: ${data.survived ? 'Survived' : 'Died'}`}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Scatter 
          name="Passengers" 
          data={data} 
          fill="#8884d8"
          shape={(props) => {
            const { cx, cy, fill, payload } = props;
            return (
              <circle 
                cx={cx} 
                cy={cy} 
                r={4 + payload.familySize} 
                fill={payload.survived ? colors[1] : colors[0]}
                stroke="#fff"
              />
            );
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default ScatterPlotComponent;