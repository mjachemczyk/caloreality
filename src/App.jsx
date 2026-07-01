import { useEffect, useMemo, useState } from "react";

import StatCard from "./components/StatCard";

import WeightGraph from "./components/WeightGraph";

const CALORIES_PER_POUND = 3500;

export default function App() {
  const [entries, setEntries] = useState([]);
  const [startWeight, setStartWeight] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [calIn, setCalIn] = useState("");
  const [netCaloriesInput, setNetCaloriesInput] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedEntries = localStorage.getItem("caloreality_entries");
    const savedStartWeight = localStorage.getItem("caloreality_start_weight");

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedStartWeight) setStartWeight(savedStartWeight);
  }, []);

  useEffect(() => {
    localStorage.setItem("caloreality_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("caloreality_start_weight", startWeight);
  }, [startWeight]);

  const normalizeBoolean = (value) => {
    return value === true || String(value).toLowerCase() === "true";
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]).map((h) => h.trim());

      const importedEntries = lines
        .slice(1)
        .map((line) => {
          const values = parseCSVLine(line);
          const row = {};

          headers.forEach((header, index) => {
            row[header] = values[index] ?? "";
          });

          return {
            date: row.date || row.Date || "",
            weekNumber: row.week_number ? Number(row.week_number) : null,
            weekday: row.weekday || "",
            overallDay: row.overall_day ? Number(row.overall_day) : null,
            phaseId: row.phase_id ? Number(row.phase_id) : null,
            dayInPhase: row.day_in_phase ? Number(row.day_in_phase) : null,
            phaseStart: normalizeBoolean(row.phase_start),
            weight: Number(row.weight_lbs || row.weight || row.Weight || 0),
            calIn: row.calories_in ? Number(row.calories_in) : null,
            netCalories:
              row.net_calories !== undefined && row.net_calories !== ""
                ? Number(row.net_calories)
                : null,
            notes: row.notes || "",
          };
        })
        .filter((entry) => entry.date && entry.weight);

      setEntries(importedEntries);

      if (importedEntries.length > 0 && !startWeight) {
        setStartWeight(String(importedEntries[0].weight));
      }
    };

    reader.readAsText(file);
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries]);


  const totalNetCalories = sortedEntries.reduce((sum, entry) => {
    return sum + (entry.netCalories || 0);
  }, 0);

  const totalCaloriesIn = sortedEntries.reduce((sum, entry) => {
    return sum + (entry.calIn || 0);
  }, 0);

  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const latestWeight = latestEntry?.weight ?? null;

  const predictedWeight =
    startWeight && totalNetCalories !== null
      ? Number(startWeight) + totalNetCalories / CALORIES_PER_POUND
      : null;

  const predictedVsActual =
    latestWeight && predictedWeight ? latestWeight - predictedWeight : null;

  const addEntry = () => {
    if (!date || !weight) return;

    const lastEntry = entries[entries.length - 1];
    const hasNewPhase = notes.includes("*");

    const nextPhaseId = hasNewPhase
      ? (lastEntry?.phaseId || 1) + 1
      : lastEntry?.phaseId || 1;

    const nextDayInPhase = hasNewPhase ? 1 : (lastEntry?.dayInPhase || 0) + 1;

    const newEntry = {
      date,
      weekNumber: null,
      weekday: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
      }),
      overallDay: entries.length + 1,
      phaseId: nextPhaseId,
      dayInPhase: nextDayInPhase,
      phaseStart: hasNewPhase,
      weight: Number(weight),
      calIn: calIn ? Number(calIn) : null,
      netCalories: netCaloriesInput ? Number(netCaloriesInput) : null,
      notes,
    };

    setEntries([...entries, newEntry]);

    setDate("");
    setWeight("");
    setCalIn("");
    setNetCaloriesInput("");
    setNotes("");
  };

  const clearData = () => {
    const confirmed = window.confirm("Clear all entries?");
    if (!confirmed) return;

    setEntries([]);
    localStorage.removeItem("caloreality_entries");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>CaloReality</h1>
            <p style={styles.subtitle}>
              Calorie tracking vs real body response.
            </p>
          </div>

          <button style={styles.dangerButton} onClick={clearData}>
            Clear Data
          </button>
        </header>

        <nav style={styles.tabs}>
          <button
            style={activeTab === "dashboard" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>

          <button
            style={activeTab === "graph" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("graph")}
          >
            Weight Graph
          </button>

          <button
            style={activeTab === "history" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </nav>

        {activeTab === "dashboard" && (
          <>
            <section style={styles.card}>
              <h2>Import CSV</h2>
              <p style={styles.muted}>
                Supports your full CaloReality master CSV.
              </p>
              <input type="file" accept=".csv" onChange={handleCSVUpload} />
            </section>

            <section style={styles.card}>
              <h2>Start Settings</h2>
              <label style={styles.label}>
                Starting Weight
                <input
                  style={styles.input}
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  placeholder="Example: 174.8"
                />
              </label>
            </section>

            <section style={styles.grid}>
              <StatCard label="Days Tracked" value={sortedEntries.length} />
              <StatCard
                label="Latest Weight"
                value={latestWeight ? `${latestWeight.toFixed(1)} lb` : "N/A"}
              />
              <StatCard
                label="Total Calories In"
                value={totalCaloriesIn.toLocaleString()}
              />
              <StatCard
                label="Net Calories"
                value={totalNetCalories.toLocaleString()}
              />
              <StatCard
                label="Predicted Weight"
                value={
                  predictedWeight ? `${predictedWeight.toFixed(1)} lb` : "N/A"
                }
              />
              <StatCard
                label="Actual vs Predicted"
                value={
                  predictedVsActual !== null
                    ? `${predictedVsActual.toFixed(1)} lb`
                    : "N/A"
                }
              />
            </section>

            <section style={styles.card}>
              <h2>Add Daily Entry</h2>

              <div style={styles.formGrid}>
                <Input label="Date" type="date" value={date} setValue={setDate} />
                <Input label="Weight" value={weight} setValue={setWeight} />
                <Input
                  label="Calories In"
                  value={calIn}
                  setValue={setCalIn}
                />
                <Input
                  label="Net Calories"
                  value={netCaloriesInput}
                  setValue={setNetCaloriesInput}
                />
                <Input label="Notes" value={notes} setValue={setNotes} full />
              </div>

              <button style={styles.primaryButton} onClick={addEntry}>
                Add Entry
              </button>
            </section>
          </>
        )}

       {activeTab === "graph" && <WeightGraph sortedEntries={sortedEntries} />}

        {activeTab === "history" && (
          <section style={styles.card}>
            <h2>History</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Phase</th>
                    <th>Phase Day</th>
                    <th>Weight</th>
                    <th>Calories In</th>
                    <th>Net</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry, index) => (
                    <tr key={`${entry.date}-${index}`}>
                      <td>{entry.date}</td>
                      <td>{entry.overallDay ?? "-"}</td>
                      <td>{entry.phaseId ?? "-"}</td>
                      <td>{entry.dayInPhase ?? "-"}</td>
                      <td>{entry.weight}</td>
                      <td>{entry.calIn ?? "-"}</td>
                      <td>{entry.netCalories ?? "-"}</td>
                      <td>{entry.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, setValue, type = "text", full = false }) {
  return (
    <label style={full ? styles.labelFull : styles.label}>
      {label}
      <input
        style={styles.input}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
    padding: "24px",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "40px", margin: 0 },
  subtitle: { margin: "6px 0 0", color: "#6b7280" },
  tabs: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  tab: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "white",
    cursor: "pointer",
  },
  activeTab: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  graphStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  statLabel: { margin: 0, color: "#6b7280", fontSize: "14px" },
  statValue: { margin: "8px 0 0", fontSize: "26px" },
  muted: { color: "#6b7280" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
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
  labelFull: {
    display: "flex",
    flexDirection: "column",
    fontWeight: 600,
    gap: "6px",
    gridColumn: "1 / -1",
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
  primaryButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
  dangerButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "10px",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
  chartBox: {
    width: "100%",
    height: "460px",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
};