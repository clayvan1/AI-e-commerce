// src/components/Charts/LineChart.jsx
import React from 'react';
import './LineChart';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useStateContext } from '../../../contexts/ContextProvider';
import { lineCustomSeries } from '../../../data/dummy';

const CustomLineChart = () => {
  const { currentMode } = useStateContext();

  const data = lineCustomSeries[0]?.dataSource || [];

  return (
    <div
      className="line-chart-container"
      style={{
        width: '100%',
        height: '100%', // ✅ Now it will inherit height from parent
        '--grid-color': currentMode === 'Dark' ? '#444' : '#ccc',
        '--axis-color': currentMode === 'Dark' ? '#eee' : '#333',
        '--tooltip-bg': currentMode === 'Dark' ? 'rgba(34,34,34,0.9)' : '#fff',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
        
          data={data}
          margin={{ top: 15, right: 10,  bottom: 5 }}
        >
          <CartesianGrid stroke="var(--grid-color)" />
          <XAxis
            dataKey="x"
            stroke="var(--axis-color)"
            tickFormatter={(x) =>
              new Date(x).toLocaleDateString('en-US', { month: 'short' })
            }
          />
          <YAxis stroke="var(--axis-color)" />
          <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)' }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
