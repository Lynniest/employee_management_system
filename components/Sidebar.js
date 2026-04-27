'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/employees', label: 'Employees' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/requests', label: 'Requests' },
  { href: '/employee', label: 'Employee Portal' },
  { href: '/employees/register', label: 'Register Employee' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-card">
          <div className="brand-mark">AI</div>
          <div>
            <p className="brand-title">Shift Sync</p>
            <p className="brand-subtitle">Manager & Employee UI</p>
          </div>
        </div>

        <nav className="nav-list">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <p className="sidebar-footer-label">This Week</p>
        <h3>Coverage 92%</h3>
        <p className="sidebar-footer-text">AI suggests 2 staffing changes to reduce overtime risk.</p>
      </div>
    </aside>
  );
}
