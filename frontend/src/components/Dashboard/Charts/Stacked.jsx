// src/components/Charts/StackedChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useStateContext } from '../../../contexts/ContextProvider';
import { stackedCustomSeries } from '../../../data/dummy';

const StackedChart = () => {
  const { currentMode } = useStateContext();

  const keys = Object.keys(stackedCustomSeries[0] || {}).filter((k) => k !== 'x');
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div
      className="stacked-chart-container"
      style={{
        width: '100%',
        height: '100%',
        '--grid-color': currentMode === 'Dark' ? '#444' : '#ccc',
        '--axis-color': currentMode === 'Dark' ? '#eee' : '#333',
        '--tooltip-bg': currentMode === 'Dark' ? 'rgba(34,34,34,0.9)' : '#fff',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={stackedCustomSeries}
          
        >
          <CartesianGrid stroke="var(--grid-color)" />
          <XAxis dataKey="x" stroke="var(--axis-color)" />
          <YAxis stroke="var(--axis-color)" />
          <Tooltip wrapperStyle={{ backgroundColor: 'var(--tooltip-bg)' }} />
          <Legend />

          {keys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={colors[idx % colors.length]}
              // ✅ Show only one legend label (first one)
              name={idx === 0 ? 'Sales' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedChart;
