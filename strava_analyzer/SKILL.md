---
name: strava-analytics
description: Analyze and visualize Strava running and cycling data with performance trends, comparative analysis, and training insights. Use this skill whenever the user asks about their Strava performance, running trends, training patterns, pace analysis, distance summaries, monthly or yearly comparisons, or wants to see visualizations of their athletic data. Trigger for queries like "analyze my Strava data", "show my running trends", "how has my pace improved", "monthly running summary", "compare this month to last month", or any request involving Strava performance analysis or data visualization.
compatibility: Requires strava-connector MCP server to be connected and configured
---

# Strava Analytics Skill

Transforms raw Strava data into meaningful insights through interactive visualizations, comparative analysis, and performance tracking.

## Core Capabilities

### 1. Performance Trend Analysis

- Pace progression over time (min/km)
- Distance accumulation (weekly, monthly, yearly)
- Elevation gain patterns
- Speed trends (km/h)

### 2. Comparative Analysis

- Month-over-month comparisons
- Year-over-year performance
- Activity type breakdowns
- Personal records and improvements

### 3. Training Pattern Recognition

- Consistency tracking (days active, streak analysis)
- Volume trends (total distance, time)
- Recovery patterns (days between runs)
- Training load distribution

### 4. Visual Output Formats

- Interactive charts (line, bar, scatter plots)
- Summary tables with key metrics
- Trend diagrams and infographics
- Statistical summaries

## Workflow

### Step 1: Fetch Strava Data

Use the appropriate strava-connector tool based on the user's query:

```javascript
// Recent activities
strava-connector:get_recent_activities

// Specific time range
strava-connector:get_activities_by_date_range

// Monthly stats
strava-connector:get_monthly_stats

// Activity details
strava-connector:get_activity_details
```

### Step 2: Process and Structure Data

Extract key metrics from the Strava response:

- **Temporal data**: dates, times, durations
- **Performance metrics**: pace, speed, distance, elevation
- **Activity metadata**: type, name, location
- **Derived metrics**: weekly totals, moving averages, trends

### Step 3: Generate Visualizations

Use the Visualizer tool to create appropriate charts:

**For trend analysis:**

- Line charts for pace/distance over time
- Bar charts for weekly/monthly totals
- Scatter plots for pace vs distance relationships

**For comparisons:**

- Side-by-side bar charts (month-to-month)
- Stacked bars for activity type breakdown
- Percentage change indicators

**For summaries:**

- Data tables with formatted metrics
- Key statistics cards
- Visual progress indicators

### Step 4: Provide Insights

Accompany visualizations with:

- Calculated improvements (e.g., "15% faster average pace")
- Pattern observations (e.g., "most consistent week was...")
- Milestone highlights (e.g., "new distance PR")
- Trend interpretations (e.g., "pace improving steadily")

## Data Processing Patterns

### Metric Conversions

All Strava data comes in metric units (km, m, km/h, min/km):

- Distance: kilometers with 2 decimal precision
- Pace: mm:ss/km format
- Speed: km/h with 1 decimal
- Elevation: meters as integers

### Time Handling

- Parse ISO date strings from Strava
- Group by week/month/year as needed
- Calculate time differences for consistency tracking
- Handle timezone considerations (UTC from API)

### Aggregation Logic

```javascript
// Weekly totals
const weeklyData = activities.reduce((acc, activity) => {
  const week = getWeekNumber(activity.start_date);
  acc[week] = (acc[week] || 0) + activity.distance;
  return acc;
}, {});

// Moving average (e.g., 4-week pace)
const movingAvg = (data, window) => {
  return data.map((val, idx, arr) => {
    const slice = arr.slice(Math.max(0, idx - window + 1), idx + 1);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
  });
};
```

### Comparison Calculations

```javascript
// Month-over-month change
const percentChange = ((current - previous) / previous) * 100;

// Year-over-year
const yearlyComparison = {
  thisYear: filterByYear(activities, currentYear),
  lastYear: filterByYear(activities, currentYear - 1),
  improvement: calculateMetricChange(thisYear, lastYear),
};
```

## Visualization Guidelines

### Chart Selection

- **Line charts**: Time series data (pace trends, distance over time)
- **Bar charts**: Categorical comparisons (monthly totals, activity types)
- **Tables**: Detailed metrics, multiple dimensions
- **Cards/Stats**: Single key metrics, highlights

### Color Coding

- Use consistent colors for metric types:
  - Distance: blue tones
  - Pace: green tones
  - Elevation: orange/brown tones
- Highlight improvements in positive colors (green)
- Show regressions in neutral colors (amber)

### Interactivity

When using Visualizer for charts:

- Include hover tooltips with exact values
- Show gridlines for easier reading
- Label axes clearly with units
- Add legends when multiple series exist

## Common Query Patterns

### "How has my running improved this year?"

1. Fetch activities from current year
2. Fetch activities from previous year
3. Calculate aggregate metrics (total distance, average pace, activity count)
4. Visualize side-by-side comparison
5. Highlight key improvements

### "Show me my training trends for the past 3 months"

1. Fetch activities from last 3 months
2. Group by week
3. Create line chart of weekly distance/pace
4. Add moving average trend line
5. Note consistency patterns

### "Create a monthly summary"

1. Fetch activities for the specified month
2. Calculate totals (distance, time, elevation, activities)
3. Find best performances (fastest pace, longest run)
4. Create summary table + key stat cards
5. Compare to previous month if relevant

### "How consistent have I been?"

1. Fetch recent activities (last 3-6 months)
2. Calculate days active per week
3. Identify longest streak
4. Show activity frequency chart
5. Calculate average weekly volume

## Example Outputs

### Monthly Summary Output

```
📊 December 2024 Running Summary

Key Stats:
- Total Distance: 142.5 km
- Total Activities: 18 runs
- Average Pace: 5:12/km
- Total Elevation: 1,240 m
- Active Days: 14/31 (45%)

Best Performances:
- Longest Run: 15.2 km (Dec 15)
- Fastest Pace: 4:35/km (Dec 8)
- Most Elevation: 180 m (Dec 22)

Compared to November:
- Distance: +8.3% (↑ 10.9 km)
- Pace: -2.1% faster (↓ 6 sec/km)
- Activities: +2 runs

[Interactive chart showing weekly distance trends]
[Table with individual activity details]
```

### Year-Over-Year Comparison

```
📈 2024 vs 2023 Running Analysis

Annual Totals:
                2023      2024      Change
Distance        892 km    1,147 km  +28.6%
Activities      128       156       +21.9%
Avg Pace        5:28/km   5:15/km   -4.0% (faster)
Elevation       8,420 m   10,230 m  +21.5%

Monthly Breakdown:
[Bar chart comparing monthly distances 2023 vs 2024]

Insights:
- Most improved month: August (+45% distance)
- Most consistent: October (4 runs/week both years)
- Pace improvement: 13 seconds/km faster on average
```

## Technical Notes

### Error Handling

- Check if strava-connector is available before calling tools
- Handle empty data sets gracefully (e.g., "No activities found for this period")
- Validate date ranges are reasonable
- Provide fallback text summaries if visualization fails

### Performance Considerations

- For large date ranges, summarize before visualizing
- Limit detailed tables to most recent 20-30 activities
- Use aggregated data (weekly/monthly) for long-term trends
- Cache calculated metrics within a single response

### Metric Formatting

- Pace: Always format as mm:ss/km (e.g., "5:12/km")
- Distance: 2 decimals for km (e.g., "10.43 km")
- Elevation: No decimals for meters (e.g., "245 m")
- Speed: 1 decimal for km/h (e.g., "11.5 km/h")
- Percentages: 1 decimal (e.g., "+15.3%")

## Integration with Strava MCP

This skill expects the strava-connector MCP server to be configured. The user's connector returns data in this format:

```json
{
  "distance": {
    "kilometers": "8.43",
    "meters": 8430
  },
  "pace": {
    "per_km": "4:41/km"
  },
  "speed": {
    "average_kmh": "13.0 km/h"
  },
  "elevation": {
    "gain_meters": "500 m"
  },
  "start_date": "2024-12-15T08:30:00Z",
  "elapsed_time": "2360",
  "moving_time": "2344"
}
```

Parse these structures directly - the connector has already handled unit conversions.

## Quick Reference

**Best practices:**

1. Always fetch data first, then analyze
2. Visualize trends over time when possible
3. Provide numerical context alongside charts
4. Compare to previous periods for perspective
5. Highlight achievements and improvements

**Common pitfalls to avoid:**

- Don't assume data exists for all time periods
- Don't mix activity types without clarifying
- Don't over-aggregate - preserve weekly granularity when possible
- Don't forget to show units on all metrics
- Don't create visualizations without explanatory text

**When to use this skill:**

- Any query mentioning "Strava", "running data", "training", or "performance"
- Requests for trends, summaries, comparisons, or visualizations
- Analysis of pace, distance, consistency, or progress
- Monthly/yearly reviews or progress tracking
