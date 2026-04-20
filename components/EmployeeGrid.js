export default function EmployeeGrid({ employees, title, subtitle }) {
  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <input className="small-input" placeholder="Search" />
      </div>

      <div className="employee-grid">
        {employees.map((employee) => (
          <div className="employee-card" key={employee.id}>
            <div className="employee-top">
              <div>
                <h4>{employee.name}</h4>
                <p>{employee.position || employee.role}</p>
              </div>
              <span className="hours-pill">{employee.weeklyHours || employee.hours} hrs</span>
            </div>
            <div className="skill-row">
              {(employee.skills || []).map((skill) => (
                <span className="skill-pill" key={skill}>{skill}</span>
              ))}
            </div>
            <p className="employee-pref">Preferred shift: <strong>{employee.preferredShift || employee.preference}</strong></p>
          </div>
        ))}
      </div>
    </section>
  );
}
