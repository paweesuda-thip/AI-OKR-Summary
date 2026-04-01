"use client";

import { IconChart } from "@/components/icons";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  LineChart, Line,
  PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

/* ── Shared tooltip style ── */
const TT = {
  contentStyle: {
    background: "rgba(10,10,20,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 11,
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    padding: "8px 12px",
  },
  itemStyle: { color: "rgba(255,255,255,0.8)" },
  labelStyle: { color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 10, marginBottom: 4 },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

const AXIS_TICK = { fill: "rgba(255,255,255,0.4)", fontSize: 10 };
const GRID = { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.04)" };
const COLORS = {
  spartan: "#ef4444",
  pegasus: "#3b82f6",
  unicorn: "#a855f7",
  po: "#f59e0b",
  emerald: "#10b981",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  slate: "#64748b",
};
const PIE_PALETTE = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#64748b"];
const SCATTER_PALETTE = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

/* ── Card shell ── */
function ChartCard({ title, subtitle, children, className = "" }: {
  title: string; subtitle: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5 flex flex-col ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Mock data — OKR-contextual
   ══════════════════════════════════════════ */

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const monthlyProgressData = months.map((m, i) => ({
  month: m,
  Spartan:  [42, 48, 55, 60, 65, 70, 74, 78][i],
  Pegasus:  [38, 42, 46, 50, 53, 57, 62, 65][i],
  Unicorn:  [50, 55, 60, 65, 72, 76, 80, 84][i],
  "Product Owner": [30, 35, 40, 44, 48, 52, 56, 59][i],
}));

const checkInTrends = months.map((m, i) => ({
  month: m,
  "Weekly Active":  [28, 32, 35, 38, 40, 43, 45, 48][i],
  "Check-ins":      [120, 145, 160, 175, 190, 210, 225, 240][i],
  "Missed":         [22, 18, 15, 12, 10, 8, 7, 5][i],
}));

const statusDistribution = [
  { name: "On Track", value: 42, fill: "#10b981" },
  { name: "At Risk", value: 18, fill: "#f59e0b" },
  { name: "Behind", value: 12, fill: "#ef4444" },
  { name: "Completed", value: 22, fill: "#3b82f6" },
  { name: "Not Started", value: 6, fill: "#64748b" },
];

const radarLabels = ["Progress", "KR Done", "Check-in", "Consistency", "On Track", "Quality"];
const radarData = radarLabels.map((label, i) => ({
  axis: label,
  Spartan:  [78, 68, 88, 85, 75, 82][i],
  Pegasus:  [65, 55, 72, 70, 56, 68][i],
  Unicorn:  [84, 78, 92, 90, 80, 88][i],
  "Product Owner": [59, 45, 65, 55, 50, 62][i],
}));

const krCumulative = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({
  month: m,
  Completed: [8, 18, 30, 44, 58, 72][i],
  "In Progress": [15, 22, 28, 32, 35, 38][i],
}));

const topObjectives = [
  { name: "Launch Mobile App v2", Spartan: 85, Pegasus: 0, total: 85 },
  { name: "Reduce Churn Rate", Spartan: 0, Unicorn: 78, total: 78 },
  { name: "Expand APAC Market", Pegasus: 72, "Product Owner": 0, total: 72 },
  { name: "Improve NPS Score", Unicorn: 0, "Product Owner": 68, total: 68 },
  { name: "Automate CI/CD", Spartan: 65, Pegasus: 0, total: 65 },
  { name: "Security Compliance", Unicorn: 60, Spartan: 0, total: 60 },
  { name: "Revamp Onboarding", "Product Owner": 55, Pegasus: 0, total: 55 },
].sort((a, b) => b.total - a.total);

const scatterData = [
  { group: "Spartan", data: [{ x: 28, y: 78, z: 12 }, { x: 22, y: 65, z: 8 }, { x: 25, y: 72, z: 10 }, { x: 30, y: 82, z: 14 }, { x: 18, y: 55, z: 6 }] },
  { group: "Pegasus", data: [{ x: 15, y: 58, z: 7 }, { x: 20, y: 62, z: 9 }, { x: 12, y: 48, z: 5 }, { x: 18, y: 56, z: 8 }, { x: 22, y: 68, z: 11 }] },
  { group: "Unicorn", data: [{ x: 32, y: 85, z: 15 }, { x: 28, y: 80, z: 12 }, { x: 35, y: 90, z: 16 }, { x: 24, y: 74, z: 10 }, { x: 30, y: 82, z: 13 }] },
  { group: "Product Owner", data: [{ x: 10, y: 42, z: 4 }, { x: 14, y: 50, z: 6 }, { x: 16, y: 54, z: 7 }, { x: 12, y: 46, z: 5 }, { x: 8, y: 38, z: 3 }] },
];

/* ══════════════════════════════════════════
   Component
   ══════════════════════════════════════════ */

export default function ChartsSection() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <IconChart size={16} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-xs text-muted-foreground">Comprehensive performance comparison across multiple dimensions</p>
        </div>
      </div>

      {/* ── Row 1: Grouped Bar + Line ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grouped Bar — Monthly Progress */}
        <ChartCard title="Monthly OKR Progress" subtitle="Team progress trends across months">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyProgressData} barCategoryGap="18%">
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Bar dataKey="Spartan" fill={COLORS.spartan} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Pegasus" fill={COLORS.pegasus} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Unicorn" fill={COLORS.unicorn} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Product Owner" fill={COLORS.po} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Line — Check-in Trends */}
        <ChartCard title="Check-in Activity" subtitle="Engagement metrics over time">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={checkInTrends}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Line type="monotone" dataKey="Check-ins" stroke={COLORS.pegasus} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.pegasus }} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="Weekly Active" stroke={COLORS.emerald} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.emerald }} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="Missed" stroke={COLORS.rose} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2.5, fill: COLORS.rose }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Donut + Radar + Area ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Donut — Status Distribution */}
        <ChartCard title="Objective Status" subtitle="Distribution by current status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={200}
                animationDuration={800}
              >
                {statusDistribution.map((entry, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i]} className="drop-shadow-sm" />
                ))}
              </Pie>
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar — Team Capabilities */}
        <ChartCard title="Team Capabilities" subtitle="Multi-axis performance comparison">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Spartan" dataKey="Spartan" stroke={COLORS.spartan} fill={COLORS.spartan} fillOpacity={0.12} strokeWidth={2} />
              <Radar name="Pegasus" dataKey="Pegasus" stroke={COLORS.pegasus} fill={COLORS.pegasus} fillOpacity={0.08} strokeWidth={1.5} />
              <Radar name="Unicorn" dataKey="Unicorn" stroke={COLORS.unicorn} fill={COLORS.unicorn} fillOpacity={0.12} strokeWidth={2} />
              <Radar name="Product Owner" dataKey="Product Owner" stroke={COLORS.po} fill={COLORS.po} fillOpacity={0.08} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area — Cumulative KR Completion */}
        <ChartCard title="KR Completion" subtitle="Cumulative key results over time">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={krCumulative}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.pegasus} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.pegasus} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              <Area type="monotone" dataKey="Completed" stroke={COLORS.emerald} fill="url(#gradCompleted)" strokeWidth={2.5} dot={{ r: 3, fill: COLORS.emerald, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="In Progress" stroke={COLORS.pegasus} fill="url(#gradInProgress)" strokeWidth={2} dot={{ r: 2.5, fill: COLORS.pegasus, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 3: Horizontal Bar + Scatter ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Horizontal Bar — Top Objectives */}
        <ChartCard title="Top Objectives" subtitle="Highest progress objectives by team ownership">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topObjectives} layout="vertical" barCategoryGap="20%">
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Bar dataKey="Spartan" stackId="a" fill={COLORS.spartan} radius={[0, 0, 0, 0]} maxBarSize={14} />
              <Bar dataKey="Pegasus" stackId="a" fill={COLORS.pegasus} radius={[0, 0, 0, 0]} maxBarSize={14} />
              <Bar dataKey="Unicorn" stackId="a" fill={COLORS.unicorn} radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="Product Owner" stackId="a" fill={COLORS.po} radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter — Check-in vs Progress Correlation */}
        <ChartCard title="Check-in vs Progress" subtitle="Scatter correlation — bubble size = streak weeks">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid {...GRID} />
              <XAxis type="number" dataKey="x" name="Check-ins" tick={AXIS_TICK} axisLine={false} tickLine={false} label={{ value: "Check-ins", position: "insideBottom", offset: -2, style: { fill: "rgba(255,255,255,0.3)", fontSize: 9 } }} />
              <YAxis type="number" dataKey="y" name="Progress %" tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[30, 100]} label={{ value: "Progress %", angle: -90, position: "insideLeft", offset: 10, style: { fill: "rgba(255,255,255,0.3)", fontSize: 9 } }} />
              <ZAxis type="number" dataKey="z" range={[40, 260]} />
              <Tooltip
                {...TT}
                formatter={(value: number, name: string) => {
                  if (name === "Check-ins") return [value, "Check-ins"];
                  if (name === "Progress %") return [`${value}%`, "Progress"];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              {scatterData.map((s, i) => (
                <Scatter key={s.group} name={s.group} data={s.data} fill={SCATTER_PALETTE[i]} fillOpacity={0.7} strokeWidth={0} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
