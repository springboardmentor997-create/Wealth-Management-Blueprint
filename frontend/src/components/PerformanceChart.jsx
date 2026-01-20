import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PerformanceChart = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0
  const firstVal = hasData ? data[0]?.value ?? 0 : 0
  const hasGrowth = hasData && data.some((d) => (d?.value ?? 0) !== firstVal && (d?.value ?? 0) !== 0)

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Portfolio Growth</h2>

      {!hasData || !hasGrowth ? (
        <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
          <div className="text-gray-500">No portfolio growth data available</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" strokeWidth={3} stroke="#3b82f6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default PerformanceChart;
