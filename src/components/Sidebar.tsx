import { Link } from "@tanstack/react-router";
import { Brandmark } from "./Brandmark";
import { useAuth } from "../lib/auth";
import type { ReactNode } from "react";
import { ProjectSwitcher } from "./ProjectSwitcher";

const ico = "h-[15px] w-[15px]";

function NavItem({
  to,
  label,
  icon,
  badge,
  onClose,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClose}
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

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-4">
      {children}
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const { account } = useAuth();
  if (!account) return null;

  const content = (
    <>
      <div className="flex items-center justify-between px-2 pb-3.5 pt-1">
        <Brandmark />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-ink-3 hover:text-ink lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <ProjectSwitcher />

      <NavItem
        to="/app"
        label="Overview"
        onClose={onClose}
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
        onClose={onClose}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        }
      />
      <NavItem
        to="/app/plans"
        label="Plans"
        onClose={onClose}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
          </svg>
        }
      />

      <Group>Developers</Group>
      <NavItem
        to="/app/api-keys"
        label="API keys"
        onClose={onClose}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
            <path d="M14.7 6.3a4 4 0 0 1-5.6 5.6l-5.9 5.9a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l5.9-5.9a4 4 0 0 1 5.6-5.6z" />
          </svg>
        }
      />
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (static, hidden on mobile) */}
      <aside className="hidden lg:flex w-[210px] flex-shrink-0 flex-col gap-0.5 border-r border-line-2 bg-surface-2 px-3.5 py-4">
        {content}
      </aside>

      {/* Mobile Drawer (overlay, hidden on desktop) */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40 lg:hidden animate-fade-in"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-[210px] bg-surface-2 border-r border-line-2 px-3.5 py-4 z-50 flex flex-col gap-0.5 shadow-2xl lg:hidden animate-slide-in-left">
            {content}
          </aside>
        </>
      )}
    </>
  );
}