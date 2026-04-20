'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, setStoredAuth } from '../../lib/clientApi';

export default function ManagerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    organizationName: '',
    organizationSlug: '',
    name: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiFetch('/api/auth/register/manager', {
        method: 'POST',
        body: JSON.stringify({
          organizationName: form.organizationName,
          organizationSlug: form.organizationSlug,
          name: form.name,
          department: form.department,
          email: form.email,
          password: form.password
        })
      });
      setStoredAuth(data.token, data.organization.slug);
      setStatus('Manager account created');
      router.replace('/');
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
          <p className="eyebrow">Manager registration</p>
          <h3>Create manager account</h3>
          <p>Create a new organization and the first manager account for it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-form-grid two-grid">
          <label className="auth-field">
            <span>Organization name</span>
            <input className="search-input auth-input" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} placeholder="Acme Retail" />
          </label>
          <label className="auth-field">
            <span>Organization slug</span>
            <input className="search-input auth-input" value={form.organizationSlug} onChange={(e) => setForm({ ...form, organizationSlug: e.target.value })} placeholder="acme-retail" />
          </label>
          <label className="auth-field">
            <span>Full name</span>
            <input className="search-input auth-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Manager name" />
          </label>
          <label className="auth-field">
            <span>Department</span>
            <input className="search-input auth-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Operations" />
          </label>
          <label className="auth-field">
            <span>Work email</span>
            <input className="search-input auth-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="manager@company.com" />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" className="search-input auth-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input type="password" className="search-input auth-input" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" />
          </label>
        </div>

        <div className="button-row top-gap">
          <button type="submit" className="primary-btn wide-btn" disabled={submitting}>Create Manager Account</button>
          <Link href="/login" className="secondary-btn auth-link-btn">Back to Login</Link>
        </div>

        {status ? <p className="section-text top-gap">{status}</p> : null}
      </form>
    </section>
  );
}
