import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatCard from "./StatCard";

export default function WeightGraph({ sortedEntries }) {
  const [graphRange, setGraphRange] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [rollingAverageDays, setRollingAverageDays] = useState("7");
  const [showDailyWeight, setShowDailyWeight] = useState(true);
  const [showRollingAvg, setShowRollingAvg] = useState(true);
  const [showMinMax, setShowMinMax] = useState(true);

  const filteredEntries = useMemo(() => {
    if (graphRange === "all") return sortedEntries;
    return sortedEntries.slice(-Number(graphRange));
  }, [sortedEntries, graphRange]);

  const chartEntries = useMemo(() => {
    const rollingDays = Number(rollingAverageDays);

    return filteredEntries.map((entry, index, array) => {
      const rollingWindow = array.slice(
        Math.max(0, index - rollingDays + 1),
        index + 1
      );

      const rollingAvg =
        rollingWindow.reduce((sum, item) => sum + item.weight, 0) /
        rollingWindow.length;

      return {
        date: entry.date,
        weight: Number(entry.weight.toFixed(1)),
        rollingAvg: Number(rollingAvg.toFixed(2)),
        caloriesIn: entry.calIn || 0,
        netCalories: entry.netCalories || 0,
      };
    });
  }, [filteredEntries, rollingAverageDays]);

  const graphStats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        startWeight: null,
        endWeight: null,
        change: null,
        high: null,
        low: null,
      };
    }

    const weights = filteredEntries.map((entry) => entry.weight);
    const first = filteredEntries[0].weight;
    const last = filteredEntries[filteredEntries.length - 1].weight;

    return {
      startWeight: first,
      endWeight: last,
      change: last - first,
      high: Math.max(...weights),
      low: Math.min(...weights),
    };
  }, [filteredEntries]);

  const renderChart = () => {
    if (chartEntries.length === 0) {
      return <p style={styles.muted}>Import data first to view charts.</p>;
    }

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={460}>
          <BarChart data={chartEntries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
            <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip />
            {showDailyWeight && <Bar dataKey="weight" name="Daily Weight" />}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={460}>
          <AreaChart data={chartEntries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
            <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip />
            {showDailyWeight && (
              <Area
                type="monotone"
                dataKey="weight"
                name="Daily Weight"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            )}
            {showRollingAvg && (
              <Line
                type="monotone"
                dataKey="rollingAvg"
                name={`${rollingAverageDays}-Day Avg`}
                dot={false}
                strokeWidth={3}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={460}>
        <LineChart data={chartEntries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
          <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
          <Tooltip />
          {showDailyWeight && (
            <Line
              type="monotone"
              dataKey="weight"
              name="Daily Weight"
              dot={false}
              strokeWidth={2}
            />
          )}
          {showRollingAvg && (
            <Line
              type="monotone"
              dataKey="rollingAvg"
              name={`${rollingAverageDays}-Day Avg`}
              dot={false}
              strokeWidth={3}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <section style={styles.card}>
      <h2>Weight Graph</h2>

      <div style={styles.graphStatsGrid}>
        <StatCard
          label="Start Weight"
          value={
            graphStats.startWeight
              ? `${graphStats.startWeight.toFixed(1)} lb`
              : "N/A"
          }
        />
        <StatCard
          label="End Weight"
          value={
            graphStats.endWeight
              ? `${graphStats.endWeight.toFixed(1)} lb`
              : "N/A"
          }
        />
        <StatCard
          label="Change"
          value={
            graphStats.change !== null
              ? `${graphStats.change >= 0 ? "+" : ""}${graphStats.change.toFixed(
                  1
                )} lb`
              : "N/A"
          }
        />
        {showMinMax && (
          <>
            <StatCard
              label="Low"
              value={graphStats.low ? `${graphStats.low.toFixed(1)} lb` : "N/A"}
            />
            <StatCard
              label="High"
              value={
                graphStats.high ? `${graphStats.high.toFixed(1)} lb` : "N/A"
              }
            />
          </>
        )}
      </div>

      <div style={styles.controls}>
        <label style={styles.label}>
          Range
          <select
            style={styles.input}
            value={graphRange}
            onChange={(e) => setGraphRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 180 days</option>
            <option value="365">Last year</option>
            <option value="730">Last 2 years</option>
            <option value="all">All time</option>
          </select>
        </label>

        <label style={styles.label}>
          Chart Type
          <select
            style={styles.input}
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
          </select>
        </label>

        <label style={styles.label}>
          Rolling Average
          <select
            style={styles.input}
            value={rollingAverageDays}
            onChange={(e) => setRollingAverageDays(e.target.value)}
          >
            <option value="3">3-day</option>
            <option value="7">7-day</option>
            <option value="14">14-day</option>
            <option value="30">30-day</option>
            <option value="60">60-day</option>
            <option value="90">90-day</option>
          </select>
        </label>
      </div>

      <div style={styles.toggleRow}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showDailyWeight}
            onChange={(e) => setShowDailyWeight(e.target.checked)}
          />
          Daily weight
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showRollingAvg}
            onChange={(e) => setShowRollingAvg(e.target.checked)}
          />
          Rolling average
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showMinMax}
            onChange={(e) => setShowMinMax(e.target.checked)}
          />
          Show high and low cards
        </label>
      </div>

      <div style={styles.chartBox}>{renderChart()}</div>
    </section>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  graphStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  controls: {
    display: "flex",
    gap: "20px",
    alignItems: "end",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  toggleRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontWeight: 600,
    gap: "6px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
  },
  chartBox: {
    width: "100%",
    height: "460px",
  },
  muted: {
    color: "#6b7280",
  },
};