'use client';

import { useEffect, useMemo, useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import ScheduleTable from '../components/ScheduleTable';
import AiAssistantCard from '../components/AiAssistantCard';
import AlertsPanel from '../components/AlertsPanel';
import EmployeeGrid from '../components/EmployeeGrid';
import ManagerActions from '../components/ManagerActions';
import { apiFetch } from '../lib/clientApi';

function toScheduleRows(schedule) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return days.map((day) => {
    const assignments = schedule?.assignments?.filter((item) => item.day === day) || [];

    const getNames = (shift) => {
      const matches = assignments.filter((item) => item.shift === shift);
      if (!matches.length) return '—';
      return matches.map((item) => item.employeeName).join(', ');
    };

    return {
      day,
      morning: getNames('Morning'),
      afternoon: getNames('Afternoon'),
      evening: getNames('Evening'),
      status: schedule?.status || 'Draft',
    };
  });
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [scheduleRows, setScheduleRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard(showLoader = false) {
    if (showLoader) setLoading(true);

    try {
      const [summaryData, alertData, employeeData, aiData, scheduleData] =
        await Promise.all([
          apiFetch('/api/dashboard/summary'),
          apiFetch('/api/dashboard/alerts'),
          apiFetch('/api/employees'),
          apiFetch('/api/ai/suggestions'),
          apiFetch('/api/schedules'),
        ]);

      setSummary(summaryData);
      setAlerts(alertData);
      setEmployees(employeeData);
      setSuggestions(aiData);
      setScheduleRows(toScheduleRows(scheduleData?.[0]));
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard(true);
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Employees',
        value: summary?.totalEmployees ?? '—',
        subtitle: 'Active employee records',
      },
      {
        title: 'Weekly Coverage',
        value: summary?.weeklyCoverage ?? '—',
        subtitle: 'Current draft coverage',
      },
      {
        title: 'Overtime Risk',
        value: summary?.overtimeRisk ?? '—',
        subtitle: 'Needs manager review',
      },
      {
        title: 'Fairness Score',
        value: summary?.fairnessScore ?? '—',
        subtitle: `${summary?.activeRequests ?? 0} active requests`,
      },
    ],
    [summary]
  );

  async function handleGenerateSchedule() {
    try {
      await apiFetch('/api/schedules/generate', { method: 'POST' });
      await loadDashboard(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">AI-assisted workforce planning</p>
          <h1>Employee Schedule Dashboard</h1>
          <p className="hero-text">
            Monitor staffing coverage, review AI recommendations, balance fairness,
            and finalize schedules with manager approval.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" onClick={handleGenerateSchedule}>
            Generate Schedule
          </button>
          <button className="secondary-btn" onClick={() => loadDashboard(false)}>
            Refresh
          </button>
        </div>
      </section>

      <SummaryCards items={summaryCards} />

      {loading && <p className="section-text">Loading dashboard...</p>}

      <section className="two-col-layout">
        <ScheduleTable rows={scheduleRows} />
        <div className="stack-col">
          <AiAssistantCard
            suggestions={suggestions}
            onSubmitted={() => loadDashboard(false)}
          />
          <AlertsPanel alerts={alerts} />
        </div>
      </section>

      <section className="two-col-layout bottom-grid">
        <EmployeeGrid
          employees={employees.slice(0, 6)}
          title="Employee Overview"
          subtitle={`${employees.length} staff records connected to the backend`}
        />
        <ManagerActions onRefresh={() => loadDashboard(false)} />
      </section>
    </div>
  );
}