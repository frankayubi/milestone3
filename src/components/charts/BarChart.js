// src/components/charts/BarChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function BarChartComponent({ data, colors }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="gender" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="survived" name="Survived" fill={colors[1]} />
        <Bar dataKey="died" name="Did Not Survive" fill={colors[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BarChartComponent;