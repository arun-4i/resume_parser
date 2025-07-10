"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const barData = [
  { month: "Jan", users: 400, sales: 240 },
  { month: "Feb", users: 300, sales: 139 },
  { month: "Mar", users: 200, sales: 980 },
  { month: "Apr", users: 278, sales: 390 },
  { month: "May", users: 189, sales: 480 },
  { month: "Jun", users: 239, sales: 380 },
];

const lineData = [
  { day: "Mon", visits: 120 },
  { day: "Tue", visits: 210 },
  { day: "Wed", visits: 150 },
  { day: "Thu", visits: 278 },
  { day: "Fri", visits: 189 },
  { day: "Sat", visits: 239 },
  { day: "Sun", visits: 200 },
];

const pieData = [
  { name: "Chrome", value: 400 },
  { name: "Safari", value: 300 },
  { name: "Firefox", value: 300 },
  { name: "Edge", value: 200 },
];

const COLORS = ["#2563eb", "#60a5fa", "#fbbf24", "#f87171"];

const HomePage = () => {
  // Helper to generate legend payload for recharts
  const barLegendPayload = [
    { value: "Users", type: "square", color: "var(--chart-1)" },
    { value: "Sales", type: "square", color: "var(--chart-2)" },
  ];
  const lineLegendPayload = [
    { value: "Visits", type: "line", color: "var(--chart-3)" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Monthly Users & Sales</h2>
          <ChartContainer
            config={{
              users: { label: "Users", color: "var(--chart-1)" },
              sales: { label: "Sales", color: "var(--chart-2)" },
            }}
            className="h-64 w-full"
          >
            <BarChart data={barData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Bar dataKey="users" fill="var(--chart-1)" radius={4} />
              <Bar dataKey="sales" fill="var(--chart-2)" radius={4} />
              <ChartTooltipContent />
              <ChartLegend
                content={<ChartLegendContent payload={barLegendPayload} />}
              />
            </BarChart>
          </ChartContainer>
        </div>
        {/* Line Chart */}
        <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Weekly Visits</h2>
          <ChartContainer
            config={{ visits: { label: "Visits", color: "var(--chart-3)" } }}
            className="h-64 w-full"
          >
            <LineChart data={lineData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <ChartTooltipContent />
              <ChartLegend
                content={<ChartLegendContent payload={lineLegendPayload} />}
              />
            </LineChart>
          </ChartContainer>
        </div>
        {/* Pie Chart */}
        <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Browser Usage</h2>
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {pieData.map((entry, idx) => (
              <span
                key={entry.name}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
