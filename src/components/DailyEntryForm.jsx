export default function DailyEntryForm({
  date,
  setDate,
  weight,
  setWeight,
  calIn,
  setCalIn,
  netCaloriesInput,
  setNetCaloriesInput,
  notes,
  setNotes,
  addEntry,
}) {
  return (
    <section style={styles.card}>
      <h2>Add Daily Entry</h2>

      <div style={styles.formGrid}>
        <Input label="Date" type="date" value={date} setValue={setDate} />
        <Input label="Weight" value={weight} setValue={setWeight} />
        <Input label="Calories In" value={calIn} setValue={setCalIn} />
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
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
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
};