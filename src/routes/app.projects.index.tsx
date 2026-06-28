import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { PageHeader, Card, Button } from "../components/ui";
import { useProjects } from "../components/ProjectContext";
import { deriveInitials } from "../lib/auth";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { current, setCurrent } = useProjects();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const remove = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Projects"
        subtitle="Each project is an app you're billing for."
        action={
          <Button variant="primary" onClick={() => navigate({ to: "/app/projects/new" })}>
            + New project
          </Button>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-[14px] bg-surface-3" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((p) => {
              const active = p.id === current?.id;
              return (
                <Card key={p.id} className="flex items-center gap-4 p-4">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[10px] bg-violet-bg text-[13px] font-extrabold text-violet">
                    {deriveInitials(p.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold">{p.name}</span>
                      {active && (
                        <span className="rounded-[6px] bg-cream px-2 py-0.5 text-[10px] font-bold text-yellow-ink">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[12px] text-ink-3">{p.description}</div>
                  </div>
                  {!active && (
                    <Button size="sm" onClick={() => setCurrent(p)}>
                      Select
                    </Button>
                  )}
                  <Link
                    to="/app/plans"
                    onClick={() => setCurrent(p)}
                    className="text-[12px] font-semibold text-yellow-deep hover:underline"
                  >
                    Plans →
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${p.name}"? This cannot be undone.`)) {
                        remove.mutate(p.id);
                      }
                    }}
                    className="text-ink-4 hover:text-red"
                    aria-label="Delete project"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-[14px] font-semibold">No projects yet</div>
            <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-3">
              Create your first project to start defining plans and accepting
              subscriptions.
            </p>
            <div className="mt-5">
              <Button variant="primary" onClick={() => navigate({ to: "/app/projects/new" })}>
                + New project
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
