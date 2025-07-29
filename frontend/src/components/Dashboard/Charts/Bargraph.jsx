// src/components/Charts/BarChartBox.jsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
// Reuse the same styling if needed

const BarChartBox = ({
  id,
  data = [],
  width = '100%',
  height = '100%',
  color = '#4F46E5',
  xKey = 'label',
  yKey = 'value',
}) => {
  const cleanData = data
    .filter(item => typeof item === 'object' && item[xKey] != null && item[yKey] != null)
    .map(item => ({
      [xKey]: item[xKey],
      [yKey]: Number(item[yKey]),
    }))
    .filter(item => !isNaN(item[yKey]));

  if (cleanData.length === 0) {
    return (
      <div
        id={id}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        No data
      </div>
    );
  }

  return (
    <div

      id={id}
      className="barchart-container"
      style={{ width, height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cleanData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartBox;
