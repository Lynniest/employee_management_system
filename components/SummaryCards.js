export default function SummaryCards({ items }) {
  return (
    <section className="summary-grid">
      {items.map((item) => (
        <div key={item.title} className="summary-card">
          <p className="summary-title">{item.title}</p>
          <h3>{item.value}</h3>
          <p className="summary-subtitle">{item.subtitle}</p>
        </div>
      ))}
    </section>
  );
}
