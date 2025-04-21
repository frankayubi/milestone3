// src/components/Controls.js
import React from 'react';

function Controls({ 
  embarkedFilter, 
  setEmbarkedFilter, 
  passengerFilter, 
  setPassengerFilter, 
  ageRange, 
  setAgeRange 
}) {
  return (
    <div className="controls">
      <div className="control-group">
        <label>Port of Embarkation:</label>
        <select 
          value={embarkedFilter} 
          onChange={(e) => setEmbarkedFilter(e.target.value)}
        >
          <option value="all">All Ports</option>
          <option value="C">Cherbourg</option>
          <option value="Q">Queenstown</option>
          <option value="S">Southampton</option>
        </select>
      </div>
      
      <div className="control-group">
        <label>Passenger Filter:</label>
        <select 
          value={passengerFilter} 
          onChange={(e) => setPassengerFilter(e.target.value)}
        >
          <option value="all">All Passengers</option>
          <option value="survivors">Survivors Only</option>
          <option value="non-survivors">Non-Survivors Only</option>
        </select>
      </div>
      
      <div className="control-group">
        <label>Age Range: {ageRange[0]} - {ageRange[1]}</label>
        <div className="range-slider">
          <input 
            type="range" 
            min="0" 
            max="80" 
            value={ageRange[0]} 
            onChange={(e) => setAgeRange([parseInt(e.target.value, 10), ageRange[1]])}
          />
          <input 
            type="range" 
            min="0" 
            max="80" 
            value={ageRange[1]} 
            onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value, 10)])}
          />
        </div>
      </div>
    </div>
  );
}

export default Controls;