"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/utils";

const brand = ["#7c3aed", "#a680ff", "#c3adff", "#8b5cf6", "#ddd2ff", "#6d28d9", "#f0abfc", "#e9d5ff", "#4c1d95", "#d8b4fe"];

export function RevenueChart({
  data,
}: {
  data: { month: string; gmv: number; bookings: number }[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece9f3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#8f8a9e" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#8f8a9e" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatINR(Number(value), true)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ece9f3",
              fontSize: 11,
              boxShadow: "0 16px 32px -16px rgba(21,19,31,0.3)",
            }}
            formatter={(value, name) =>
              name === "GMV"
                ? [formatINR(Number(value)), "Demo GMV"]
                : [String(value), "Bookings"]
            }
          />
          <Area
            type="monotone"
            dataKey="gmv"
            name="GMV"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fill="url(#gmvGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={brand[index % brand.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ece9f3",
              fontSize: 11,
            }}
            formatter={(value, name) => [`${value} products`, String(name)]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={6}
            formatter={(value) => (
              <span style={{ fontSize: 10, color: "#6f6b7d" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BookingChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece9f3" vertical={false} />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 9, fill: "#8f8a9e" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#8f8a9e" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ece9f3",
              fontSize: 11,
            }}
          />
          <Bar dataKey="count" name="Bookings" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}