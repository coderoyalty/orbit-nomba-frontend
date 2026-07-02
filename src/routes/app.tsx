import { useEffect, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authStore, useAuth, deriveInitials } from "../lib/auth";
import { projectsApi } from "../lib/api";
import { Sidebar } from "../components/Sidebar";
import { ProjectProvider, useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app")({
  // Resolve the cookie session before rendering. If not authed, bounce to login.
  beforeLoad: async () => {
    const snap = authStore.getSnapshot();
    if (snap.status === "loading") {
      await authStore.refresh();
    }
    if (authStore.getSnapshot().status !== "authed") {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <ProjectProvider>
      <AppLayout />
    </ProjectProvider>
  ),
});

function AppLayout() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const { setProjects } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load the tenant's projects once inside the dashboard.
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  useEffect(() => {
    if (projects) setProjects(projects);
  }, [projects, setProjects]);

  if (!account) return null;

  return (
    <div className="flex h-full">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line-2 bg-surface px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-ink-2 hover:text-ink lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-[13px] font-semibold text-ink-3">
              {account.name || account.email || "User"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await authStore.signOut();
                navigate({ to: "/login" });
              }}
              className="text-[12px] font-medium text-ink-3 hover:text-ink"
            >
              Sign out
            </button>
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-cream text-[12px] font-bold text-yellow-ink">
              {deriveInitials(account.name || account.email || "User")}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-surface-2 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
