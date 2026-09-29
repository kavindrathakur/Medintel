"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  Clock,
  Settings,
  Shield,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Assess", icon: Activity },
    { href: "/results", label: "Results", icon: ClipboardList },
    { href: "/history", label: "History", icon: Clock },
    { href: "/admin/rules", label: "Rules", icon: Settings },
  ];

  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link href="/" className="logo-link">
          <Shield size={28} strokeWidth={2.2} />
          <div className="logo-text">
            <span className="logo-name">MedFA</span>
            <span className="logo-badge">Decision-support prototype</span>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx>{`
        .app-header {
          background: var(--white);
          border-bottom: 1px solid var(--neutral-300);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.95);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .logo-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--primary-900);
          text-decoration: none;
          transition: opacity var(--transition-fast);
        }
        .logo-link:hover {
          opacity: 0.85;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-name {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--primary-900);
          letter-spacing: -0.01em;
        }
        .logo-badge {
          font-size: 10px;
          font-weight: 500;
          color: var(--neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--button-radius);
          font-size: 14px;
          font-weight: 500;
          color: var(--neutral-700);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .nav-link:hover {
          background: var(--primary-50);
          color: var(--primary-700);
        }
        .nav-link-active {
          background: var(--primary-100);
          color: var(--primary-700);
          font-weight: 600;
        }
        @media (max-width: 639px) {
          .logo-badge { display: none; }
          .nav-link span { display: none; }
          .nav-link { padding: var(--space-2); }
        }
      `}</style>
    </header>
  );
}
