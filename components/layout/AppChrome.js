'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { getStoredToken, clearStoredAuth } from '../../lib/clientApi';

const authRoutes = ['/login', '/register/manager'];

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isAuthPage = authRoutes.includes(pathname);

  async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}

  clearStoredAuth();
  router.push('/login');
}

  useEffect(() => {
    const token = getStoredToken();

    if (isAuthPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    setReady(true);
  }, [isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  if (!ready) {
    return (
      <main className="page-content">
        <div className="page-stack">
          <section className="hero-card">
            <div>
              <p className="eyebrow">Loading</p>
              <h1>Checking your session...</h1>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <button className="secondary-btn" onClick={handleLogout}>
  Logout
</button>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
