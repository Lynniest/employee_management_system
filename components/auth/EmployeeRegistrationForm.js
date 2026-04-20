'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/clientApi';

export default function EmployeeRegistrationForm({ departments, roles, skills }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: departments?.[0] || '',
    position: roles?.[0] || '',
    preferredShift: 'Morning',
    weeklyHours: 40,
    password: '',
    skills: []
  });

  useEffect(() => {
    apiFetch('/api/auth/me').then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  function toggleSkill(skill) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((item) => item !== skill)
        : [...prev.skills, skill]
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const created = await apiFetch('/api/employees', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setStatus(`Employee created: ${created.name}`);
      setForm({
        name: '',
        email: '',
        department: departments?.[0] || '',
        position: roles?.[0] || '',
        preferredShift: 'Morning',
        weeklyHours: 40,
        password: '',
        skills: []
      });
    } catch (error) {
      setStatus(error.message);
    }
  }

  const isManager = currentUser?.role === 'manager';

  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <p className="eyebrow">Manager-only action</p>
          <h3>Register new employee</h3>
          <p>Only managers can create employee accounts and assign the first login credentials.</p>
        </div>
        <span className="status-pill">{isManager ? 'Manager Verified' : 'Restricted'}</span>
      </div>

      {!isManager ? (
        <div className="note-card">
          <h4>Access restricted</h4>
          <p>Login as a manager first. Employee creation uses the protected <code>/api/employees</code> route.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="auth-form-grid two-grid">
            <label className="auth-field">
              <span>Employee full name</span>
              <input className="search-input auth-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Employee name" />
            </label>
            <label className="auth-field">
              <span>Email</span>
              <input className="search-input auth-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="employee@company.com" />
            </label>
            <label className="auth-field">
              <span>Department</span>
              <select className="search-input auth-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {departments.map((department) => <option key={department}>{department}</option>)}
              </select>
            </label>
            <label className="auth-field">
              <span>Role</span>
              <select className="search-input auth-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label className="auth-field">
              <span>Preferred Shift</span>
              <select className="search-input auth-input" value={form.preferredShift} onChange={(e) => setForm({ ...form, preferredShift: e.target.value })}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Weekly Hours</span>
              <input className="search-input auth-input" type="number" value={form.weeklyHours} onChange={(e) => setForm({ ...form, weeklyHours: Number(e.target.value) })} />
            </label>
            <label className="auth-field auth-field-span">
              <span>Skills</span>
              <div className="chip-grid">
                {skills.map((skill) => (
                  <label className="chip-option" key={skill}>
                    <input type="checkbox" checked={form.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </label>
            <label className="auth-field auth-field-span">
              <span>Initial password</span>
              <input type="password" className="search-input auth-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" />
            </label>
          </div>

          <div className="button-row top-gap">
            <button type="submit" className="primary-btn">Create Employee Account</button>
          </div>
        </form>
      )}

      {status ? <p className="section-text top-gap">{status}</p> : null}
    </section>
  );
}
