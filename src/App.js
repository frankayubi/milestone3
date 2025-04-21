// src/App.js
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import './App.css';

// Import components
import Controls from './components/Controls';
import StatsCards from './components/StatsCards';
import DataTable from './components/DataTable';
import BarChartComponent from './components/charts/BarChart';
import PieChartComponent from './components/charts/PieChart';
import ScatterPlotComponent from './components/charts/ScatterPlot';
import StackedBarChartComponent from './components/charts/StackedBarChart';
import FareHistogramComponent from './components/charts/FareHistogram';
import CabinHeatmapComponent from './components/charts/CabinHeatmap';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [embarkedFilter, setEmbarkedFilter] = useState('all');
  const [passengerFilter, setPassengerFilter] = useState('all');
  const [ageRange, setAgeRange] = useState([0, 80]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch the data
    fetch(`${process.env.PUBLIC_URL}/titanic.csv`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.text();
      })
      .then(text => {
        try {
          const parsedData = parseCSV(text);
          setData(parsedData);
          setLoading(false);
        } catch (err) {
          setError('Error parsing CSV data: ' + err.message);
          setLoading(false);
        }
      })
      .catch(err => {
        setError('Error loading data: ' + err.message);
        setLoading(false);
      });
  }, []);

  // Parse CSV data
  const parseCSV = (text) => {
    const lines = text.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
      .filter(line => line.trim()) // Remove empty lines
      .map(line => {
        // Handle commas within quoted strings
        const values = [];
        let insideQuotes = false;
        let currentValue = '';
        
        for (let char of line) {
          if (char === '"' && !insideQuotes) {
            insideQuotes = true;
          } else if (char === '"' && insideQuotes) {
            insideQuotes = false;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Add the last value
        
        // Create an object from headers and values
        const entry = {};
        headers.forEach((header, index) => {
          let value = values[index] || '';
          
          // Convert numeric values
          if (header === 'Age' || header === 'Fare') {
            value = parseFloat(value) || 0;
          } else if (header === 'Survived' || header === 'Pclass' || header === 'SibSp' || header === 'Parch') {
            value = parseInt(value, 10) || 0;
          } else if (header === 'Embarked') {
            // Ensure Embarked is properly formatted - trim any whitespace
            value = value.trim();
          }
          
          entry[header] = value;
        });
        
        // Add derived fields
        // Extract cabin prefix
        if (entry.Cabin && entry.Cabin !== '') {
          entry.CabinPrefix = entry.Cabin.charAt(0);
        } else {
          entry.CabinPrefix = 'Unknown';
        }
        
        // Add age group
        if (entry.Age < 10) entry.AgeGroup = '0-10';
        else if (entry.Age < 20) entry.AgeGroup = '10-20';
        else if (entry.Age < 30) entry.AgeGroup = '20-30';
        else if (entry.Age < 40) entry.AgeGroup = '30-40';
        else if (entry.Age < 50) entry.AgeGroup = '40-50';
        else if (entry.Age < 60) entry.AgeGroup = '50-60';
        else if (entry.Age < 70) entry.AgeGroup = '60-70';
        else entry.AgeGroup = '70+';
        
        // Add family size
        entry.FamilySize = entry.SibSp + entry.Parch;
        
        return entry;
      });
  };

  // Filter data based on user selections
  const getFilteredData = () => {
    return data.filter(passenger => {
      // Filter by embarked port - More robust version
      if (embarkedFilter !== 'all') {
        // Handle possible undefined values and ensure proper comparison
        const embarkedValue = passenger.Embarked ? passenger.Embarked.trim() : '';
        if (embarkedValue !== embarkedFilter) {
          return false;
        }
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

  // Prepare data for gender survival chart
  const getGenderSurvivalData = () => {
    const maleData = { gender: 'Male', survived: 0, died: 0 };
    const femaleData = { gender: 'Female', survived: 0, died: 0 };
    
    filteredData.forEach(passenger => {
      if (passenger.Sex === 'male') {
        passenger.Survived ? maleData.survived++ : maleData.died++;
      } else if (passenger.Sex === 'female') {
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
      
      // Get passengers in this age group from the already filtered data
      // (this respects the current embarked filter and age range selections)
      const ageGroupPassengers = filteredData.filter(p => p.AgeGroup === group);
      
      // Apply the appropriate passenger filter
      ageGroupPassengers.forEach(p => {
        // Only count passengers according to the selected filter
        if (
          (passengerFilter === 'all') ||
          (passengerFilter === 'survivors' && p.Survived === 1) ||
          (passengerFilter === 'non-survivors' && p.Survived === 0)
        ) {
          if (p.Pclass === 1) groupData.class1++;
          else if (p.Pclass === 2) groupData.class2++;
          else if (p.Pclass === 3) groupData.class3++;
        }
      });
      
      return groupData;
    }).filter(group => group.class1 > 0 || group.class2 > 0 || group.class3 > 0);
  };

  // Prepare data for pie chart (embarked vs survival)
  const getEmbarkedSurvivalData = () => {
    const counts = { C: { survived: 0, total: 0 }, Q: { survived: 0, total: 0 }, S: { survived: 0, total: 0 } };
    
    filteredData.forEach(p => {
      // Ensure we have a valid Embarked value
      const embarked = p.Embarked ? p.Embarked.trim() : '';
      if (embarked && (embarked === 'C' || embarked === 'Q' || embarked === 'S')) {
        counts[embarked].total++;
        if (p.Survived === 1) counts[embarked].survived++;
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
      name: p.Name,
      class: p.Pclass
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

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Titanic Passenger Dashboard</h1>
      
      {/* Controls Section */}
      <Controls 
        embarkedFilter={embarkedFilter}
        setEmbarkedFilter={setEmbarkedFilter}
        passengerFilter={passengerFilter}
        setPassengerFilter={setPassengerFilter}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
      />
      
      {/* Summary Statistics Cards */}
      <StatsCards stats={getSummaryStats()} />
      
      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Bar Chart: Survival by Gender */}
        <div className="chart-container">
          <h2>Survival Count by Gender</h2>
          <BarChartComponent data={getGenderSurvivalData()} colors={SURVIVAL_COLORS} />
        </div>
        
        {/* Pie Chart: Embarked vs Survival */}
        <div className="chart-container">
          <h2>Survival by Port of Embarkation</h2>
          <PieChartComponent data={getEmbarkedSurvivalData()} />
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Stacked Bar: Class Distribution by Age Group */}
        <div className="chart-container">
          <h2>Class Distribution of Passengers by Age Group</h2>
          <StackedBarChartComponent data={getClassByAgeData()} />
        </div>
        
        {/* Scatter Plot: Age vs Fare vs Survival */}
        <div className="chart-container">
          <h2>Fare vs Age (Colored by Survival)</h2>
          <ScatterPlotComponent data={getScatterData()} colors={SURVIVAL_COLORS} />
        </div>
      </div>
      
      {/* Charts Row 3 */}
      <div className="charts-row">
        {/* Histogram: Fare Distribution */}
        <div className="chart-container">
          <h2>Fare Distribution</h2>
          <FareHistogramComponent data={getFareHistogram()} colors={SURVIVAL_COLORS} />
        </div>
        
        {/* Heat Map: Cabin Letter vs Survival */}
        <div className="chart-container">
          <h2>Cabin Section vs Survival</h2>
          <CabinHeatmapComponent data={getCabinHeatmap()} />
        </div>
      </div>
      
      {/* Data Table */}
      <DataTable 
        data={filteredData} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
}

export default App;