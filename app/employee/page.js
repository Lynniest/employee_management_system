'use client';

import { useEffect, useState } from 'react';
import EmployeeStats from '../../components/employee/EmployeeStats';
import MyScheduleCard from '../../components/employee/MyScheduleCard';
import ProfileCard from '../../components/employee/ProfileCard';
import EmployeeRequestPanel from '../../components/employee/EmployeeRequestPanel';
import { apiFetch } from '../../lib/clientApi';

function scheduleRowsFromApi(schedules) {
  return (schedules || []).flatMap((schedule) =>
    (schedule.assignments || []).map((item) => ({
      day: item.day,
      shift: item.shift,
      location: 'Main Branch',
      status: schedule.status || 'Draft'
    }))
  );
}

export default function EmployeePortalPage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [details, setDetails] = useState([]);
  const [requests, setRequests] = useState([]);

  async function load() {
    const [me, schedules, myRequests, availability] = await Promise.all([
      apiFetch('/api/auth/me'),
      apiFetch('/api/me/schedule'),
      apiFetch('/api/me/requests'),
      apiFetch('/api/me/availability')
    ]);

    setProfile({
      name: me?.name || 'Employee',
      role: me?.position || me?.role || 'Employee',
      team: me?.department || 'General',
      nextShift: schedules?.[0]?.assignments?.[0] ? `${schedules[0].assignments[0].day} ${schedules[0].assignments[0].shift}` : 'No shift assigned',
      manager: 'Operations Manager',
      weeklyHours: `${me?.weeklyHours || 0} hrs`,
      preference: me?.preferredShift || '—'
    });

    setStats([
      { title: 'Assigned Shifts', value: `${scheduleRowsFromApi(schedules).length}`, subtitle: 'Current week' },
      { title: 'Pending Requests', value: `${myRequests.filter((item) => item.status === 'Pending').length}`, subtitle: 'Awaiting review' },
      { title: 'Availability Slots', value: `${availability.length}`, subtitle: 'Saved preferences' },
      { title: 'Weekly Hours', value: `${me?.weeklyHours || 0}`, subtitle: 'Planned workload' }
    ]);

    setSchedule(scheduleRowsFromApi(schedules));

    setDetails([
      { label: 'Email', value: me?.email || '—' },
      { label: 'Department', value: me?.department || '—' },
      { label: 'Preferred Shift', value: me?.preferredShift || '—' },
      { label: 'Availability Records', value: `${availability.length}` }
    ]);

    setRequests(myRequests.map((item) => ({
      id: item.id,
      type: item.type,
      date: item.details?.startDate || item.details?.shiftDate || new Date(item.submittedAt).toLocaleDateString(),
      status: item.status,
      detail: item.type === 'Leave'
        ? `${item.details?.startDate || ''} to ${item.details?.endDate || ''} · ${item.details?.reason || ''}`
        : `${item.details?.fromShift || ''} with ${item.details?.requestedWith || ''}`
    })));
  }

  async function createLeaveRequest(form) {
    await apiFetch('/api/requests', {
      method: 'POST',
      body: JSON.stringify({
        type: 'Leave',
        details: form
      })
    });
    await load();
  }

  async function createSwapRequest(form) {
    await apiFetch('/api/requests/swap', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Self-service employee workspace</p>
          <h1>Employee Portal</h1>
          <p className="hero-text">
            Let employees view schedules, update availability, submit leave requests, and track swaps without using the manager console.
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-btn" onClick={load}>Refresh</button>
        </div>
      </section>

      <EmployeeStats items={stats} />

      <section className="two-col-layout bottom-grid">
        <MyScheduleCard rows={schedule} />
        <ProfileCard profile={profile || {}} details={details} />
      </section>

      <EmployeeRequestPanel
        requests={requests}
        actions={['Request Leave', 'Request Shift Swap']}
        onCreateLeave={createLeaveRequest}
        onCreateSwap={createSwapRequest}
      />
    </div>
  );
}
