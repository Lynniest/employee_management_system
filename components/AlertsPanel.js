export default function AlertsPanel({ alerts }) {
  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>Alerts & Recommendations</h3>
          <p>AI highlights schedule risks and suggested changes</p>
        </div>
      </div>

      <div className="alert-list">
        {alerts.map((alert) => (
          <div className="alert-item" key={alert.title}>
            <div className="alert-icon">!</div>
            <div>
              <h4>{alert.title}</h4>
              <p>{alert.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
