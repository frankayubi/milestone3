// src/components/charts/FareHistogram.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function FareHistogramComponent({ data, colors }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip 
          labelFormatter={(value) => `Fare: $${value}`}
          formatter={(value, name) => {
            if (name === 'survived') {
              return [`${value} passengers`, 'Survived'];
            }
            return [`${value} passengers`, 'Total'];
          }}
        />
        <Legend />
        <Bar dataKey="survived" name="Survived" fill={colors[1]} />
        <Bar dataKey="count" name="Total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default FareHistogramComponent;