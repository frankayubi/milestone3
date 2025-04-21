// src/components/StatsCards.js
import React from 'react';

function StatsCards({ stats }) {
  return (
    <div className="stat-cards">
      <div className="stat-card">
        <h3>Total Passengers</h3>
        <p>{stats.total}</p>
      </div>
      <div className="stat-card">
        <h3>Survivors</h3>
        <p>{stats.survivors} ({stats.survivalRate}%)</p>
      </div>
      <div className="stat-card">
        <h3>Average Age</h3>
        <p>{stats.avgAge} years</p>
      </div>
      <div className="stat-card">
        <h3>Average Fare</h3>
        <p>${stats.avgFare}</p>
      </div>
    </div>
  );
}

export default StatsCards;