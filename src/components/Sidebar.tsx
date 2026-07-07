import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Brandmark } from "./Brandmark";
import { useAuth } from "../lib/auth";
import type { ReactNode } from "react";
import { useProjects } from "./ProjectContext";

const ico = "h-[15px] w-[15px]";

function NavItem({
  to,
  params,
  label,
  icon,
  badge,
  onClose,
}: {
  to: string;
  params?: any;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <Link
      to={to}
      params={params}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-3 [&.active]:bg-cream [&.active]:font-semibold [&.active]:text-yellow-ink"
      activeProps={{ className: "active" }}
      activeOptions={{ exact: to === "/app" || to === "/app/$projectId" }}
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
  const { current, setCurrent, projects } = useProjects();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
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

      {current && (
        <div className="px-2.5 pb-4 pt-1.5 border-b border-line-2 relative">
          <label className="text-[9px] font-bold tracking-wider text-ink-3 block mb-1.5 uppercase select-none">
            Active Project
          </label>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full h-8.5 bg-surface border border-line-2 rounded-[6px] px-2.5 flex items-center justify-between text-[12.5px] font-medium text-ink hover:bg-surface-3 transition-all cursor-pointer focus:outline-none select-none"
            >
              <span className="truncate">{current.name}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 opacity-60 flex-shrink-0 ml-2">
                <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
              </svg>
            </button>

            {isOpen && (
              <>
                {/* Backdrop trigger to close menu */}
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
                
                {/* Custom Popover Container */}
                <div className="absolute left-0 right-0 mt-1 bg-surface border border-line rounded-[8px] p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-100 origin-top">
                  <div className="text-[9px] font-bold text-ink-3 px-2 py-1 uppercase tracking-wider select-none">
                    Switch Workspace
                  </div>
                  <div className="space-y-0.5 max-h-[160px] overflow-y-auto">
                    {projects.map((p) => {
                      const active = p.id === current.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate({ to: "/app/$projectId", params: { projectId: p.id } });
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-[12px] font-medium rounded-[5px] text-left hover:bg-surface-3 transition-colors cursor-pointer ${
                            active ? "text-yellow-deep font-semibold" : "text-ink"
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {active && (
                            <span className="text-[10px] font-bold text-yellow-deep bg-cream px-1.5 py-0.5 rounded-[4px] border border-yellow/10">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="my-1 border-t border-line-2" />

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setCurrent(null);
                      navigate({ to: "/app" });
                    }}
                    className="w-full flex items-center px-2 py-1.5 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-3 rounded-[5px] transition-colors cursor-pointer text-left"
                  >
                    <span>← View all projects</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-0.5">
        <NavItem
          to={current ? "/app/$projectId" : "/app"}
          params={current ? { projectId: current.id } : undefined}
          label={current ? "Dashboard" : "Overview"}
          onClose={onClose}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
              <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
            </svg>
          }
        />

        {current && (
          <>
            <NavItem
              to="/app/$projectId/plans"
              params={{ projectId: current.id }}
              label="Plans"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                </svg>
              }
            />
            <NavItem
              to="/app/$projectId/subscribers"
              params={{ projectId: current.id }}
              label="Subscribers"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
              }
            />

            <Group>Developers</Group>
            <NavItem
              to="/app/$projectId/api-keys"
              params={{ projectId: current.id }}
              label="API keys"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <path d="M14.7 6.3a4 4 0 0 1-5.6 5.6l-5.9 5.9a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l5.9-5.9a4 4 0 0 1 5.6-5.6z" />
                </svg>
              }
            />
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-3 select-none"
            >
              <span className="opacity-60">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              API Reference
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto h-3 w-3 opacity-40">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
            <NavItem
              to="/app/$projectId/webhooks"
              params={{ projectId: current.id }}
              label="Webhooks"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <path d="M20 4h-3.17l-1-1h-7.66l-1 1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              }
            />
            <NavItem
              to="/app/$projectId/dunning"
              params={{ projectId: current.id }}
              label="Dunning"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              }
            />
            <NavItem
              to="/app/$projectId/billing"
              params={{ projectId: current.id }}
              label="Billing Engine"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <NavItem
              to="/app/$projectId/settings/payouts"
              params={{ projectId: current.id }}
              label="Payout Settings"
              onClose={onClose}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ico}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
            />
          </>
        )}
      </div>
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