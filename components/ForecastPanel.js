export default function ForecastPanel({ items }) {
  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>Demand Forecast</h3>
          <p>Predicted staffing needs by shift window</p>
        </div>
      </div>

      <div className="forecast-list">
        {items.map((item) => (
          <div className="forecast-card" key={item.time}>
            <div>
              <h4>{item.time}</h4>
              <p>{item.note}</p>
            </div>
            <div className="forecast-metric">{item.staffNeeded}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
