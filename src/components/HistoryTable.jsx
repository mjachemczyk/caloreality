export default function HistoryTable({ sortedEntries }) {
  return (
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
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};