'use client';

import { useState } from 'react';

export default function EmployeeRequestPanel({ requests, onCreateLeave, onCreateSwap }) {
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [swapForm, setSwapForm] = useState({ shiftDate: '', fromShift: 'Morning', requestedWith: '' });

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h3>My Requests</h3>
          <p>Track shift swap, leave, and availability changes</p>
        </div>
      </div>

      <div className="request-list">
        {requests.map((request) => (
          <div key={request.id} className="request-card request-card-stack">
            <div>
              <h4>{request.type}</h4>
              <p>{request.date}</p>
            </div>
            <span className="status-pill">{request.status}</span>
            <p className="request-detail-text">{request.detail}</p>
          </div>
        ))}
      </div>

      <div className="two-col-layout top-gap">
        <div className="panel-card">
          <div className="panel-header-simple">
            <div>
              <h3>Request Leave</h3>
              <p>Create a leave request through the API</p>
            </div>
          </div>
          <div className="auth-form-grid">
            <label className="auth-field">
              <span>Start date</span>
              <input type="date" className="search-input auth-input" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
            </label>
            <label className="auth-field">
              <span>End date</span>
              <input type="date" className="search-input auth-input" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
            </label>
            <label className="auth-field">
              <span>Reason</span>
              <input className="search-input auth-input" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Reason" />
            </label>
          </div>
          <button className="primary-btn top-gap" onClick={() => onCreateLeave?.(leaveForm)}>Submit Leave Request</button>
        </div>

        <div className="panel-card">
          <div className="panel-header-simple">
            <div>
              <h3>Request Shift Swap</h3>
              <p>Submit a swap request through the API</p>
            </div>
          </div>
          <div className="auth-form-grid">
            <label className="auth-field">
              <span>Shift date</span>
              <input type="date" className="search-input auth-input" value={swapForm.shiftDate} onChange={(e) => setSwapForm({ ...swapForm, shiftDate: e.target.value })} />
            </label>
            <label className="auth-field">
              <span>Shift</span>
              <select className="search-input auth-input" value={swapForm.fromShift} onChange={(e) => setSwapForm({ ...swapForm, fromShift: e.target.value })}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Swap with</span>
              <input className="search-input auth-input" value={swapForm.requestedWith} onChange={(e) => setSwapForm({ ...swapForm, requestedWith: e.target.value })} placeholder="Coworker name" />
            </label>
          </div>
          <button className="primary-btn top-gap" onClick={() => onCreateSwap?.(swapForm)}>Submit Swap Request</button>
        </div>
      </div>
    </section>
  );
}
