# Titanic Dashboard

An interactive data visualization dashboard for exploring the Titanic passenger dataset with filters, charts, and detailed passenger information.

## Features

### Interactive Filters
- **Embarked Port Filter**: Filter passengers by port of embarkation (Cherbourg, Queenstown, Southampton)
- **Passenger Status Filter**: Focus on all passengers, survivors only, or non-survivors only
- **Age Range Slider**: Filter passengers by age (0-80 years)
- **Search Box**: Find specific passengers by name

### Visualizations
1. **Summary Statistics Cards**
   - Total passenger count
   - Survivor count and percentage
   - Average age
   - Average fare

2. **Bar Chart: Survival Count by Gender**
   - Highlights gender-based survival disparities

3. **Pie Chart: Survival by Port of Embarkation**
   - Shows how embarkation port correlates with survival rates

4. **Stacked Bar Chart: Class Distribution of Survivors by Age Group**
   - Demonstrates how both class and age influenced survival odds

5. **Scatter Plot: Fare vs Age**
   - Points colored by survival status
   - Point size represents family size (SibSp + Parch)
   - Interactive tooltips with passenger details

6. **Histogram: Fare Distribution**
   - Shows fare distribution with survival breakdown

7. **Heatmap: Cabin Section vs Survival**
   - Visualizes potential spatial survival patterns on the ship based on cabin letter prefixes

8. **Data Table**
   - Searchable, paginated table with detailed passenger information
   - Tooltip reveals ticket information
   - Color-coded rows based on survival status

## Getting Started

### Prerequisites
- Node.js and npm installed

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Place the `titanic.csv` file in the `public` folder
4. Start the development server: `npm start`

## Data Source
The dashboard uses the Titanic passenger dataset, which includes:
- Demographics (age, gender)
- Ticket information (class, fare, cabin)
- Family relationships (siblings/spouses, parents/children)
- Survival status

## Implementation Details

### Dashboard Components Organization

The dashboard layout is designed to fit on a single screen without scrolling, using a responsive grid system that adapts to different screen sizes. Components are organized in a logical flow:

1. **Control Panel** - Top section with all interactive filters
2. **Summary Statistics** - Key metrics displayed prominently 
3. **Primary Visualizations** - Main charts showing critical relationships
4. **Secondary Visualizations** - Additional charts for deeper analysis
5. **Data Table** - Bottom section for detailed passenger data exploration

### Interactivity Implementation

All visualizations are dynamically updated based on user filter selections:
- The **Embarked Filter** updates the pie chart and all other visualizations
- The **Passenger Filter** allows focusing on survivors, non-survivors, or all passengers
- The **Age Slider** updates the stacked bar chart and all other visualizations

### Technology Stack
- **React**: Front-end framework
- **Recharts**: Chart visualization library
- **CSS**: Custom styling with responsive design

## Design Principles Applied

1. **Clean Layout**: All visuals fit on one page without scrolling
2. **Effective Encoding**: Uses color, size, and position consistently for clarity
3. **User-Focused**: Historians can study class and gender effects; data scientists can test model hypotheses visually
4. **Minimized Clutter**: Avoids 3D charts, redundant visuals, or overly saturated colors