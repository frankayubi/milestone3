// src/utils/constants.js

// Color definitions
export const COLORS = {
    // Survival status colors
    SURVIVED: '#82ca9d',  // Green
    DIED: '#ff8884',      // Red
    
    // Class colors
    CLASS_1: '#8884d8',   // Purple
    CLASS_2: '#82ca9d',   // Green
    CLASS_3: '#ffc658',   // Yellow
    
    // Chart colors
    CHART_COLORS: [
      '#0088FE',  // Blue
      '#00C49F',  // Teal
      '#FFBB28',  // Yellow
      '#FF8042',  // Orange
      '#8884d8',  // Purple
      '#83a6ed',  // Light Blue
    ],
    
    // Embarked port colors
    EMBARKED: {
      C: '#8884d8',  // Cherbourg - Purple
      Q: '#ffc658',  // Queenstown - Yellow
      S: '#83a6ed',  // Southampton - Light Blue
    }
  };
  
  // Age group definitions
  export const AGE_GROUPS = [
    '0-10',
    '10-20',
    '20-30',
    '30-40',
    '40-50',
    '50-60',
    '60-70',
    '70+'
  ];
  
  // Cabin prefixes
  export const CABIN_PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'T', 'Unknown'];
  
  // Embarkation ports
  export const EMBARKATION_PORTS = {
    C: 'Cherbourg',
    Q: 'Queenstown',
    S: 'Southampton'
  };
  
  // Passenger classes
  export const PASSENGER_CLASSES = {
    1: '1st Class',
    2: '2nd Class',
    3: '3rd Class'
  };
  
  // Mapping for survival status
  export const SURVIVAL_STATUS = {
    0: 'Did Not Survive',
    1: 'Survived'
  };