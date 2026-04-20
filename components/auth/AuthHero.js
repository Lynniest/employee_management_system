export default function AuthHero({ eyebrow, title, text, points }) {
  return (
    <section className="auth-hero">
      <div className="brand-card auth-brand-card">
        <div className="brand-mark">AI</div>
        <div>
          <p className="brand-title">Scheduler Pro</p>
          <p className="brand-subtitle">Secure workforce scheduling</p>
        </div>
      </div>

      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-text">{text}</p>
      </div>

      <div className="auth-point-list">
        {points.map((point) => (
          <div className="auth-point" key={point.title}>
            <div className="auth-point-icon">✓</div>
            <div>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
