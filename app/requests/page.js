'use client';

import { useEffect, useState } from 'react';
import RequestList from '../../components/RequestList';
import AlertsPanel from '../../components/AlertsPanel';
import { apiFetch } from '../../lib/clientApi';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);

  async function load() {
    const [requestData, alertData] = await Promise.all([
      apiFetch('/api/requests'),
      apiFetch('/api/dashboard/alerts')
    ]);
    setRequests(requestData);
    setAlerts(alertData);
  }

  async function updateStatus(id, status) {
    await apiFetch(`/api/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    await load();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div className="page-stack">
      <section className="section-header-card">
        <div>
          <p className="eyebrow">Approvals and exceptions</p>
          <h1>Requests</h1>
          <p className="section-text">Manage leave requests, shift swaps, and schedule exceptions before publishing the final weekly plan.</p>
        </div>
        <button className="primary-btn" onClick={load}>Refresh Requests</button>
      </section>

      <section className="two-col-layout">
        <RequestList
          requests={requests}
          onApprove={(id) => updateStatus(id, 'Approved')}
          onDeny={(id) => updateStatus(id, 'Denied')}
        />
        <AlertsPanel alerts={alerts} />
      </section>
    </div>
  );
}
