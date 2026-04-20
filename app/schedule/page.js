'use client';

import { useEffect, useState } from 'react';
import ScheduleTable from '../../components/ScheduleTable';
import ForecastPanel from '../../components/ForecastPanel';
import { apiFetch } from '../../lib/clientApi';

function toScheduleRows(schedule) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day) => {
    const assignments = schedule?.assignments?.filter((item) => item.day === day) || [];
    return {
      day,
      morning: assignments.find((item) => item.shift === 'Morning')?.employeeName || '—',
      afternoon: assignments.find((item) => item.shift === 'Afternoon')?.employeeName || '—',
      evening: assignments.find((item) => item.shift === 'Evening')?.employeeName || '—',
      status: schedule?.status || 'Draft'
    };
  });
}

function toForecastItems(items) {
  return items.map((item) => ({
    time: `${item.day} · ${item.shift}`,
    note: `Predicted demand: ${item.predictedDemand}`,
    staffNeeded: `${item.requiredStaff} staff`
  }));
}

export default function SchedulePage() {
  const [rows, setRows] = useState([]);
  const [forecast, setForecast] = useState([]);

  async function load() {
    const [schedules, forecastData] = await Promise.all([
      apiFetch('/api/schedules'),
      apiFetch('/api/dashboard/forecast')
    ]);
    setRows(toScheduleRows(schedules?.[0]));
    setForecast(toForecastItems(forecastData));
  }

  async function runOptimization() {
    await apiFetch('/api/schedules/generate', { method: 'POST' });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-stack">
      <section className="section-header-card">
        <div>
          <p className="eyebrow">Shift planning</p>
          <h1>Schedule Planner</h1>
          <p className="section-text">Compare AI-generated shift assignments with predicted staffing demand and manager review status.</p>
        </div>
        <div className="button-row">
          <button className="primary-btn" onClick={runOptimization}>Run Optimization</button>
          <button className="secondary-btn" onClick={load}>Refresh</button>
        </div>
      </section>

      <section className="two-col-layout">
        <ScheduleTable rows={rows} />
        <ForecastPanel items={forecast} />
      </section>
    </div>
  );
}
