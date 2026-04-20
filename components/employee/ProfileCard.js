export default function ProfileCard({ profile = {}, details = [] }) {
  const initials = (profile?.name || 'EM')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="panel-card">
      <div className="employee-profile-head">
        <div className="employee-profile-avatar">{initials}</div>
        <div>
          <p className="eyebrow">Employee Portal</p>
          <h3>{profile.name || 'Employee'}</h3>
          <p>{profile.role || 'Role'} · {profile.team || 'Team'}</p>
        </div>
      </div>

      <div className="employee-profile-grid">
        <div className="note-card">
          <h4>Next Shift</h4>
          <p>{profile.nextShift || '—'}</p>
        </div>
        <div className="note-card">
          <h4>Manager</h4>
          <p>{profile.manager || '—'}</p>
        </div>
        <div className="note-card">
          <h4>Weekly Hours</h4>
          <p>{profile.weeklyHours || '—'}</p>
        </div>
        <div className="note-card">
          <h4>Preferred Shift</h4>
          <p>{profile.preference || '—'}</p>
        </div>
      </div>

      <div className="employee-detail-list">
        {details.map((item) => (
          <div key={item.label} className="detail-row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
