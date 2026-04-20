export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="topbar-label">Operations overview</p>
        <h2>Workforce Scheduling System</h2>
      </div>
      <div className="topbar-right">
        <input className="search-input" placeholder="Search employee, role, or shift" />
        <div className="user-chip">
          <div className="user-avatar">M</div>
          <div>
            <p className="user-name">Manager</p>
            <p className="user-role">Scheduling Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
