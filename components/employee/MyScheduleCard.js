export default function MyScheduleCard({ rows }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h3>My Weekly Schedule</h3>
          <p>Personal shifts for the current week</p>
        </div>
        <button className="secondary-btn">Download</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Shift</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.day}>
                <td className="strong-cell">{row.day}</td>
                <td>{row.shift}</td>
                <td>{row.location}</td>
                <td><span className="status-pill">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
