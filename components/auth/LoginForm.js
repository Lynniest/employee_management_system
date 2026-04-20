'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getStoredOrganizationSlug, setStoredAuth } from '../../lib/clientApi';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    role: 'manager',
    organizationSlug: getStoredOrganizationSlug(),
    email: '',
    password: ''
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus('Signing in...');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setStoredAuth(data.token, data.organization.slug);
      setStatus('Login successful');
      router.replace(data.route || '/');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="panel-header-simple">
        <div>
          <p className="eyebrow">Sign in</p>
          <h3>Login to your account</h3>
          <p>Login with your organization slug, role, email, and password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-form-grid">
          <label className="auth-field">
            <span>Organization slug</span>
            <input className="search-input auth-input" value={form.organizationSlug} onChange={(e) => setForm({ ...form, organizationSlug: e.target.value })} placeholder="acme-retail" />
          </label>

          <label className="auth-field">
            <span>Role</span>
            <select className="search-input auth-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input className="search-input auth-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input type="password" className="search-input auth-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />
          </label>
        </div>

        <div className="button-row top-gap">
          <button type="submit" className="primary-btn wide-btn" disabled={submitting}>Login</button>
        </div>

        {status ? <p className="section-text top-gap">{status}</p> : null}
      </form>

      <div className="auth-divider">or</div>

      <div className="auth-row responsive-row">
        <Link href="/register/manager" className="secondary-btn auth-link-btn">
          Register as Manager
        </Link>
        <div className="auth-note-box">
          <strong>Employee accounts</strong>
          <p>Employees cannot self-register. A manager must create them inside the organization workspace.</p>
        </div>
      </div>
    </section>
  );
}
