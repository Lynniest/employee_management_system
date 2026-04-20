export default function AvailabilityBoard({ rows }) {
  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>Availability Board</h3>
          <p>Weekly employee availability and leave blocks</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="strong-cell">{row.name}</td>
                <td>{row.mon}</td>
                <td>{row.tue}</td>
                <td>{row.wed}</td>
                <td>{row.thu}</td>
                <td>{row.fri}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
