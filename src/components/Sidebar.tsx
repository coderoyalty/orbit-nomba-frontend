import { Link } from "@tanstack/react-router";
import { Brandmark } from "./Brandmark";
import { useAuth } from "../lib/auth";

const ico = "h-[15px] w-[15px]";

function NavItem({
  to,
  label,
  icon,
  badge,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-3 [&.active]:bg-cream [&.active]:font-semibold [&.active]:text-yellow-ink"
      activeProps={{ className: "active" }}
      activeOptions={{ exact: to === "/app" }}
    >
      <span className="opacity-60 [.active_&]:opacity-100">{icon}</span>
      {label}
      {badge ? <span className="ml-auto">{badge}</span> : null}
    </Link>
  );
}

// Kept for when the backend endpoints ship.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Group({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-4">
      {children}
    </div>
  );
}

import type { ReactNode } from "react";
// import { Badge } from "./ui";
import { ProjectSwitcher } from "./ProjectSwitcher";

export function Sidebar() {
  const { account } = useAuth();
  if (!account) return null;

  return (
    <aside className="flex w-[210px] flex-shrink-0 flex-col gap-0.5 border-r border-line-2 bg-surface-2 px-3.5 py-4">
      <Brandmark className="px-2 pb-3.5 pt-1" />

      <ProjectSwitcher />

      <NavItem
        to="/app"
        label="Overview"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
          </svg>
        }
      />
      <NavItem
        to="/app/projects"
        label="Projects"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        }
      />
      <NavItem
        to="/app/plans"
        label="Plans"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
          </svg>
        }
      />

      {/* Hidden until backend endpoints ship
      <NavItem
        to="/app/subscribers"
        label="Subscribers"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </svg>
        }
      />
      <NavItem
        to="/app/invoices"
        label="Invoices"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
          </svg>
        }
      />

      <Group>Recovery</Group>
      <NavItem
        to="/app/billing"
        label="Billing engine"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
          </svg>
        }
      />
      <NavItem
        to="/app/dunning"
        label="Dunning"
        badge={<Badge tone="red">23</Badge>}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M12 2v4M12 18v4M5 5l3 3M16 16l3 3M2 12h4M18 12h4" />
          </svg>
        }
      />
      */}

      <Group>Developers</Group>
      <NavItem
        to="/app/api-keys"
        label="API keys"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M14.7 6.3a4 4 0 0 1-5.6 5.6l-5.9 5.9a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l5.9-5.9a4 4 0 0 1 5.6-5.6z" />
          </svg>
        }
      />

      {/* Hidden until backend endpoints ship
      <NavItem
        to="/app/webhooks"
        label="Webhooks"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        }
      />

      <Group>Settings</Group>
      <NavItem
        to="/app/settings/payouts"
        label="Payouts"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" />
          </svg>
        }
      />
      */}
    </aside>
  );
}