# Titanic Dashboard

An interactive data visualization dashboard for exploring the Titanic passenger dataset.

![Dashboard Preview](https://example.com/dashboard-preview.png)

## Features

### Interactive Filters
- **Embarkation Port Filter**: Filter by Cherbourg (C), Queenstown (Q), or Southampton (S)
- **Passenger Status Filter**: View all passengers, survivors only, or non-survivors only
- **Age Range Slider**: Filter passengers by age (0-80)
- **Search Box**: Find specific passengers by name

### Visualizations

#### Summary Statistics Cards
Quick-reference cards showing total passenger count, survival rates, average age, and average fare.

#### Bar Chart: Survival Count by Gender
Highlights gender-based survival disparities with color-coded bars.

#### Pie Chart: Survival by Port of Embarkation
Shows how embarkation port correlates with survival rates.

#### Stacked Bar Chart: Class Distribution of Survivors by Age Group
Demonstrates how both class and age influenced survival odds.

#### Scatter Plot: Fare vs Age
- Points colored by survival status
- Point size represents family size
- Interactive tooltips with passenger details

#### Histogram: Fare Distribution
Shows fare distribution with survival breakdown.

#### Heatmap: Cabin Section vs Survival
Visualizes potential spatial survival patterns based on cabin letter prefixes.

#### Data Table
Searchable, paginated data table with detailed passenger information.

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/titanic-dashboard.git
   cd titanic-dashboard
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Place the Titanic dataset CSV file in the public folder
   ```bash
   cp path/to/your/titanic.csv public/
   ```

4. Start the development server
   ```bash
   npm start
   ```

5. Open your browser and navigate to http://localhost:3000

## Project Structure

```
titanic-dashboard/
│
├── public/
│   └── titanic.csv         # Dataset
│
├── src/
│   ├── components/         # Reusable components
│   │   ├── Controls.js     # Filter controls
│   │   ├── DataTable.js    # Paginated data table
│   │   ├── StatsCards.js   # Summary statistics
│   │   └── charts/         # Visualization components
│   │
│   ├── utils/              # Utility functions
│   │   ├── dataProcessing.js
│   │   └── constants.js
│   │
│   ├── App.js              # Main component
│   └── App.css             # Styles
│
└── README.md
```

## Data Source

This dashboard uses the Titanic passenger dataset, which includes:

- Demographics (age, gender)
- Ticket information (class, fare, cabin)
- Family relationships (siblings/spouses, parents/children)
- Survival status

## Technologies Used

- React.js - Frontend framework
- Recharts - Chart visualization library
- CSS - Custom styling with responsive design

## Design Principles

- **Clean Layout**: All visuals fit on one page without scrolling
- **Effective Encoding**: Uses color, size, and position consistently for clarity
- **User-Focused**: Designed for both historical analysis and data exploration
- **Minimized Clutter**: Avoids 3D charts, redundant visuals, or overly saturated colors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Titanic passenger data provided by [Kaggle](https://www.kaggle.com/c/titanic)
- Inspired by data visualization best practices from Edward Tufte and Stephen Few