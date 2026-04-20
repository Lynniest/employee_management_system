export default function RequestList({ requests, onApprove, onDeny }) {
  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>Request Queue</h3>
          <p>Manager can approve or deny pending changes</p>
        </div>
      </div>

      <div className="request-list">
        {requests.map((request) => (
          <div className="request-card" key={request.id}>
            <div>
              <h4>{request.employeeName}</h4>
              <p>{request.type}</p>
              <span className="request-reason">
                {request.type === 'Leave'
                  ? `${request.details?.startDate || ''} to ${request.details?.endDate || ''} · ${request.details?.reason || ''}`
                  : `${request.details?.shiftDate || ''} · ${request.details?.fromShift || ''} with ${request.details?.requestedWith || ''}`}
              </span>
              <p className="section-text">Status: {request.status}</p>
            </div>
            <div className="button-row">
              <button className="secondary-btn" onClick={() => onDeny?.(request.id)}>Deny</button>
              <button className="primary-btn" onClick={() => onApprove?.(request.id)}>Approve</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
