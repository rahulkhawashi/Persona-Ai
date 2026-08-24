import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WellnessTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8FA099', fontSize: '13.5px', fontStyle: 'italic' }}>
        No historical assessments recorded yet. Submit your first read above!
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((log, idx) => ({
    index: idx + 1,
    date: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: Number(log.predicted_score)
  }));

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 107, 94, 0.1)" vertical={false} />
          <XAxis dataKey="date" stroke="#8FA099" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(59, 107, 94, 0.2)' }} />
          <YAxis stroke="#8FA099" fontSize={11} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} axisLine={{ stroke: 'rgba(59, 107, 94, 0.2)' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid rgba(180, 170, 150, 0.3)', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(77, 92, 86, 0.1)',
              fontSize: '12px',
              color: '#1F2925'
            }} 
            formatter={(value) => [`${value} / 10`, 'Score']}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3B6B5E" 
            strokeWidth={2.5} 
            dot={{ fill: '#3B6B5E', r: 4 }} 
            activeDot={{ r: 6, fill: '#2E7D68', stroke: '#FFF', strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
