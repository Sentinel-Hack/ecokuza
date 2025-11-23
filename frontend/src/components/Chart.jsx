import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Chart = ({ title, data, type = "line", height = 280 }) => {
  return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {title}
      </h3>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          {type === "line" ? (
            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />

              {/* Main Bar */}
              <Bar dataKey="value" name="NDMI" fill="#3b82f6" radius={[4, 4, 0, 0]} />

              {/* Optional Rainfall Overlay */}
              {data.some((d) => d.rainfall) && (
                <Bar dataKey="rainfall" name="Rainfall" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Chart