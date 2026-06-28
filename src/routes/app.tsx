import { useEffect } from "react";
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
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line-2 bg-surface px-6 py-3.5">
          <span className="text-[13px] font-semibold text-ink-3">
            {account.name}
          </span>
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
              {deriveInitials(account.name)}
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
