// src/components/charts/StackedBarChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StackedBarChartComponent({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ageGroup" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="class1" name="1st Class" stackId="a" fill="#8884d8" />
        <Bar dataKey="class2" name="2nd Class" stackId="a" fill="#82ca9d" />
        <Bar dataKey="class3" name="3rd Class" stackId="a" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default StackedBarChartComponent;