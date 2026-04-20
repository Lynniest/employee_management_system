export default function ScheduleTable({ rows }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h3>Weekly Schedule</h3>
          <p>AI-generated assignments for morning, afternoon, and evening shifts</p>
        </div>
        <select className="panel-select" defaultValue="This Week">
          <option>This Week</option>
          <option>Next Week</option>
          <option>Custom</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Morning</th>
              <th>Afternoon</th>
              <th>Evening</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.day}>
                <td className="strong-cell">{row.day}</td>
                <td>{row.morning}</td>
                <td>{row.afternoon}</td>
                <td>{row.evening}</td>
                <td><span className="status-pill">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
