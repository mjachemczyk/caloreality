export default function StatCard({ label, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.label}>{label}</p>
      <h3 style={styles.value}>{value}</h3>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
  },

  label: {
    margin: 0,
    color: "#6b7280",
    fontSize: 14,
  },

  value: {
    marginTop: 8,
    marginBottom: 0,
    fontSize: 26,
  },
};