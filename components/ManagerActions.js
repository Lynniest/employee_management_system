'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/clientApi';

export default function ManagerActions({ onRefresh }) {
  const router = useRouter();

  const actions = [
    'Approve Final Schedule',
    'Edit Assignments',
    'Review Leave Requests',
    'Open Shift Swap Requests',
    'View Forecast Logs',
    'Generate Schedule'
  ];

  async function handleAction(action) {
    try {
      switch (action) {
        case 'Approve Final Schedule':
          await apiFetch('/api/schedules/approve', {
            method: 'POST'
          });
          alert('Schedule approved successfully');
          onRefresh?.();
          break;

        case 'Edit Assignments':
          router.push('/schedule');
          break;

        case 'Review Leave Requests':
          router.push('/requests');
          break;

        case 'Open Shift Swap Requests':
          router.push('/requests');
          break;

        case 'View Forecast Logs':
          router.push('/schedule');
          break;

        case 'Generate Schedule':
          await apiFetch('/api/schedules/generate', {
            method: 'POST'
          });
          alert('Schedule generated successfully');
          onRefresh?.();
          break;

        default:
          alert(`${action} clicked`);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Action failed');
    }
  }

  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>Manager Actions</h3>
          <p>Quick actions for schedule management</p>
        </div>
      </div>

      <div className="action-list top-gap">
        {actions.map((action) => (
          <button
            key={action}
            className="action-btn full-btn"
            onClick={() => handleAction(action)}
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}