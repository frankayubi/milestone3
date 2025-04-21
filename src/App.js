// src/App.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, 
         LineChart, Line, AreaChart, Area } from 'recharts';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [embarkedFilter, setEmbarkedFilter] = useState('all');
  const [passengerFilter, setPassengerFilter] = useState('all');
  const [ageRange, setAgeRange] = useState([0, 80]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For this demo, we'll load it from a CSV file
    fetch('/titanic.csv')
      .then(response => response.text())
      .then(text => {
        const parsedData = parseCSV(text);
        setData(parsedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  // Function to parse CSV data
  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const entry = {};
      
      headers.forEach((header, index) => {
        let value = values[index];
        if (header === 'Age' || header === 'Fare') {
          value = parseFloat(value) || 0;
        } else if (header === 'Survived' || header === 'Pclass' || header === 'SibSp' || header === 'Parch') {
          value = parseInt(value, 10) || 0;
        }
        entry[header.trim()] = value;
      });
      
      // Extract cabin prefix for the heatmap
      if (entry.Cabin && entry.Cabin !== '') {
        entry.CabinPrefix = entry.Cabin.charAt(0);
      } else {
        entry.CabinPrefix = 'Unknown';
      }
      
      // Add age group for the stacked bar chart
      if (entry.Age < 10) entry.AgeGroup = '0-10';
      else if (entry.Age < 20) entry.AgeGroup = '10-20';
      else if (entry.Age < 30) entry.AgeGroup = '20-30';
      else if (entry.Age < 40) entry.AgeGroup = '30-40';
      else if (entry.Age < 50) entry.AgeGroup = '40-50';
      else if (entry.Age < 60) entry.AgeGroup = '50-60';
      else if (entry.Age < 70) entry.AgeGroup = '60-70';
      else entry.AgeGroup = '70+';
      
      // Add total family size
      entry.FamilySize = entry.SibSp + entry.Parch;
      
      return entry;
    });
  };

  // Filter data based on user selections
  const getFilteredData = () => {
    return data.filter(passenger => {
      // Filter by embarked port
      if (embarkedFilter !== 'all' && passenger.Embarked !== embarkedFilter) {
        return false;
      }
      
      // Filter by survival status
      if (passengerFilter === 'survivors' && passenger.Survived !== 1) {
        return false;
      }
      if (passengerFilter === 'non-survivors' && passenger.Survived !== 0) {
        return false;
      }
      
      // Filter by age range
      if (passenger.Age < ageRange[0] || passenger.Age > ageRange[1]) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !passenger.Name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const filteredData = getFilteredData();

  // Prepare data for summary statistics
  const getSummaryStats = () => {
    const total = filteredData.length;
    const survivors = filteredData.filter(p => p.Survived === 1).length;
    const survivalRate = total ? (survivors / total * 100).toFixed(1) : 0;
    const avgAge = total ? (filteredData.reduce((sum, p) => sum + p.Age, 0) / total).toFixed(1) : 0;
    const avgFare = total ? (filteredData.reduce((sum, p) => sum + p.Fare, 0) / total).toFixed(2) : 0;
    
    return { total, survivors, survivalRate, avgAge, avgFare };
  };
  
  const stats = getSummaryStats();

  // Prepare data for gender survival chart
  const getGenderSurvivalData = () => {
    const maleData = { gender: 'Male', survived: 0, died: 0 };
    const femaleData = { gender: 'Female', survived: 0, died: 0 };
    
    filteredData.forEach(passenger => {
      if (passenger.Sex === 'male') {
        passenger.Survived ? maleData.survived++ : maleData.died++;
      } else {
        passenger.Survived ? femaleData.survived++ : femaleData.died++;
      }
    });
    
    return [maleData, femaleData];
  };

  // Prepare data for class distribution by age chart
  const getClassByAgeData = () => {
    const ageGroups = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70+'];
    
    return ageGroups.map(group => {
      const groupData = { ageGroup: group, class1: 0, class2: 0, class3: 0 };
      
      filteredData
        .filter(p => p.AgeGroup === group && p.Survived === 1)
        .forEach(p => {
          if (p.Pclass === 1) groupData.class1++;
          else if (p.Pclass === 2) groupData.class2++;
          else if (p.Pclass === 3) groupData.class3++;
        });
      
      return groupData;
    });
  };

  // Prepare data for pie chart (embarked vs survival)
  const getEmbarkedSurvivalData = () => {
    const counts = { C: { survived: 0, total: 0 }, Q: { survived: 0, total: 0 }, S: { survived: 0, total: 0 } };
    
    filteredData.forEach(p => {
      if (p.Embarked && (p.Embarked === 'C' || p.Embarked === 'Q' || p.Embarked === 'S')) {
        counts[p.Embarked].total++;
        if (p.Survived === 1) counts[p.Embarked].survived++;
      }
    });
    
    return [
      { name: 'Cherbourg (C)', value: counts.C.survived, fill: '#82ca9d' },
      { name: 'Cherbourg (C) - Died', value: counts.C.total - counts.C.survived, fill: '#ff8884' },
      { name: 'Queenstown (Q)', value: counts.Q.survived, fill: '#8884d8' },
      { name: 'Queenstown (Q) - Died', value: counts.Q.total - counts.Q.survived, fill: '#ffc658' },
      { name: 'Southampton (S)', value: counts.S.survived, fill: '#83a6ed' },
      { name: 'Southampton (S) - Died', value: counts.S.total - counts.S.survived, fill: '#8dd1e1' },
    ].filter(segment => segment.value > 0);
  };
  
  // Prepare data for scatter plot (Age vs Fare vs Survival)
  const getScatterData = () => {
    return filteredData.map(p => ({
      age: p.Age,
      fare: p.Fare > 200 ? 200 : p.Fare, // Cap fare for better visualization
      survived: p.Survived,
      familySize: p.FamilySize,
      name: p.Name
    }));
  };

  // Prepare data for fare histogram
  const getFareHistogram = () => {
    const buckets = Array(20).fill().map((_, i) => ({ range: `${i*10}-${(i+1)*10}`, count: 0, survived: 0 }));
    
    filteredData.forEach(p => {
      // Make sure p.Fare is a number and not undefined
      if (p.Fare !== undefined && !isNaN(p.Fare)) {
        const bucketIndex = Math.min(Math.floor(p.Fare / 10), 19);
        if (buckets[bucketIndex]) {
          buckets[bucketIndex].count++;
          if (p.Survived === 1) buckets[bucketIndex].survived++;
        }
      }
    });
    
    return buckets.filter(b => b.count > 0);
  };

  // Prepare data for cabin heatmap
  const getCabinHeatmap = () => {
    const cabins = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'T', 'Unknown'];
    const heatmapData = [];
    
    cabins.forEach(cabin => {
      const cabinPassengers = filteredData.filter(p => p.CabinPrefix === cabin);
      const survived = cabinPassengers.filter(p => p.Survived === 1).length;
      const died = cabinPassengers.length - survived;
      
      if (cabinPassengers.length > 0) {
        heatmapData.push({ cabin, status: 'Survived', count: survived });
        heatmapData.push({ cabin, status: 'Died', count: died });
      }
    });
    
    return heatmapData;
  };

  // Custom color scales
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];
  const SURVIVAL_COLORS = { 0: '#ff8884', 1: '#82ca9d' };

  // Handler for table pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const tableData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Titanic Passenger Dashboard</h1>
      
      {/* Controls Section */}
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
      
      {/* Summary Statistics Cards */}
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
      
      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Bar Chart: Survival by Gender */}
        <div className="chart-container">
          <h2>Survival Count by Gender</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getGenderSurvivalData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gender" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="survived" name="Survived" fill={SURVIVAL_COLORS[1]} />
              <Bar dataKey="died" name="Did Not Survive" fill={SURVIVAL_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Pie Chart: Embarked vs Survival */}
        <div className="chart-container">
          <h2>Survival by Port of Embarkation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getEmbarkedSurvivalData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {getEmbarkedSurvivalData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Stacked Bar: Class Distribution by Age Group */}
        <div className="chart-container">
          <h2>Class Distribution of Survivors by Age Group</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getClassByAgeData()}>
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
        </div>
        
        {/* Scatter Plot: Age vs Fare vs Survival */}
        <div className="chart-container">
          <h2>Fare vs Age (Colored by Survival)</h2>
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
                data={getScatterData()} 
                fill="#8884d8"
                shape={(props) => {
                  const { cx, cy, fill, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4 + payload.familySize} 
                      fill={payload.survived ? SURVIVAL_COLORS[1] : SURVIVAL_COLORS[0]}
                      stroke="#fff"
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Charts Row 3 */}
      <div className="charts-row">
        {/* Histogram: Fare Distribution */}
        <div className="chart-container">
          <h2>Fare Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getFareHistogram()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="survived" name="Survived" fill={SURVIVAL_COLORS[1]} />
              <Bar dataKey="count" name="Total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Heat Map: Cabin Letter vs Survival */}
        <div className="chart-container">
          <h2>Cabin Section vs Survival</h2>
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
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'T', 'Unknown'].map(cabin => {
                  const cabinData = getCabinHeatmap();
                  const survived = cabinData.find(d => d.cabin === cabin && d.status === 'Survived')?.count || 0;
                  const died = cabinData.find(d => d.cabin === cabin && d.status === 'Died')?.count || 0;
                  const total = survived + died;
                  const rate = total ? ((survived / total) * 100).toFixed(1) : '0';
                  
                  // Skip if no passengers in this cabin
                  if (total === 0) return null;
                  
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
        </div>
      </div>
      
      {/* Data Table */}
      <div className="data-table-container">
        <h2>Passenger Data</h2>
        
        <div className="table-controls">
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Class</th>
                <th>Fare</th>
                <th>Cabin</th>
                <th>Embarked</th>
                <th>Survived</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((passenger, index) => (
                <tr key={index} className={passenger.Survived ? 'survived' : 'died'}>
                  <td title={`Ticket: ${passenger.Ticket}`}>{passenger.Name}</td>
                  <td>{passenger.Age}</td>
                  <td>{passenger.Sex}</td>
                  <td>{passenger.Pclass}</td>
                  <td>${passenger.Fare.toFixed(2)}</td>
                  <td>{passenger.Cabin || 'Unknown'}</td>
                  <td>{passenger.Embarked || 'Unknown'}</td>
                  <td>{passenger.Survived ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="table-footer">
          Showing {tableData.length} of {filteredData.length} passengers
        </div>
      </div>
    </div>
  );
}

export default App;