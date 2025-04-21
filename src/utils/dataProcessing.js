// src/utils/dataProcessing.js
import { AGE_GROUPS } from './constants';

/**
 * Parse CSV string into an array of objects
 * @param {string} text - CSV data as string
 * @returns {Array} Array of passenger objects
 */
export const parseCSV = (text) => {
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
        }
        
        entry[header] = value;
      });
      
      // Add derived fields
      entry.CabinPrefix = entry.Cabin && entry.Cabin !== '' ? entry.Cabin.charAt(0) : 'Unknown';
      entry.AgeGroup = getAgeGroup(entry.Age);
      entry.FamilySize = entry.SibSp + entry.Parch;
      
      return entry;
    });
};

/**
 * Determine age group based on age
 * @param {number} age - Passenger age
 * @returns {string} Age group
 */
export const getAgeGroup = (age) => {
  if (age < 10) return AGE_GROUPS[0];
  else if (age < 20) return AGE_GROUPS[1];
  else if (age < 30) return AGE_GROUPS[2];
  else if (age < 40) return AGE_GROUPS[3];
  else if (age < 50) return AGE_GROUPS[4];
  else if (age < 60) return AGE_GROUPS[5];
  else if (age < 70) return AGE_GROUPS[6];
  else return AGE_GROUPS[7];
};

/**
 * Filter data based on user selections
 * @param {Array} data - Full passenger data
 * @param {Object} filters - User-selected filters
 * @returns {Array} Filtered data
 */
export const filterData = (data, { embarkedFilter, passengerFilter, ageRange, searchTerm }) => {
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

/**
 * Calculate summary statistics from filtered data
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Object} Summary statistics
 */
export const getSummaryStats = (filteredData) => {
  const total = filteredData.length;
  const survivors = filteredData.filter(p => p.Survived === 1).length;
  const survivalRate = total ? (survivors / total * 100).toFixed(1) : 0;
  const avgAge = total ? (filteredData.reduce((sum, p) => sum + p.Age, 0) / total).toFixed(1) : 0;
  const avgFare = total ? (filteredData.reduce((sum, p) => sum + p.Fare, 0) / total).toFixed(2) : 0;
  
  return { total, survivors, survivalRate, avgAge, avgFare };
};

/**
 * Prepare data for gender survival chart
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Array} Data formatted for the gender survival chart
 */
export const getGenderSurvivalData = (filteredData) => {
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

/**
 * Prepare data for class distribution by age chart
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Array} Data formatted for the class/age chart
 */
export const getClassByAgeData = (filteredData) => {
  const result = AGE_GROUPS.map(group => {
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
  
  // Remove empty age groups
  return result.filter(group => group.class1 > 0 || group.class2 > 0 || group.class3 > 0);
};

/**
 * Prepare data for scatter plot (Age vs Fare vs Survival)
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Array} Data formatted for the scatter plot
 */
export const getScatterData = (filteredData) => {
  return filteredData.map(p => ({
    age: p.Age,
    fare: p.Fare > 200 ? 200 : p.Fare, // Cap fare for better visualization
    survived: p.Survived,
    familySize: p.FamilySize,
    name: p.Name,
    class: p.Pclass
  }));
};

/**
 * Prepare data for fare histogram
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Array} Data formatted for the fare histogram
 */
export const getFareHistogram = (filteredData) => {
  const buckets = Array(20).fill().map((_, i) => ({ range: `${i*10}-${(i+1)*10}`, count: 0, survived: 0 }));
  
  filteredData.forEach(p => {
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

/**
 * Prepare data for cabin heatmap
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Array} Data formatted for the cabin heatmap
 */
export const getCabinHeatmap = (filteredData) => {
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

/**
 * Prepare data for pie chart (embarked vs survival)
 * @param {Array} filteredData - Filtered passenger data
 * @returns {Array} Data formatted for the embarked pie chart
 */
export const getEmbarkedSurvivalData = (filteredData) => {
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