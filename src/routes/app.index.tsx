import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, PageHeader, Button, Field, TextInput } from "../components/ui";
import { projectsApi, type Project } from "../lib/api";
import { ApiError } from "../lib/http";

export const Route = createFileRoute("/app/")({
  component: Overview,
});

function deriveInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Overview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load all projects
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  // Project creation mutation
  const createProject = useMutation({
    mutationFn: (body: { name: string; description: string }) =>
      projectsApi.create(body),
    onSuccess: (newProj: Project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowModal(false);
      setName("");
      setDescription("");
      navigate({ to: "/app/$projectId", params: { projectId: newProj.id } });
    },
  });

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Project name must be at least 2 characters.";
    }
    if (!description.trim()) {
      nextErrors.description = "Please add a description.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createProject.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Workspaces"
        subtitle="Select a workspace project to continue."
      />

      <div className="mt-8">
        {loadingProjects ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-[8px] bg-surface-3" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((p) => (
              <Card
                key={p.id}
                onClick={() => {
                  navigate({ to: "/app/$projectId", params: { projectId: p.id } });
                }}
                className="p-5 flex flex-col justify-between hover:border-ink-3 transition-colors cursor-pointer min-h-[140px] border border-line bg-surface rounded-[8px] shadow-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[6px] bg-surface-3 text-[12px] font-bold text-ink-2 select-none border border-line">
                      {deriveInitials(p.name)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-ink truncate">
                        {p.name}
                      </h3>
                      <div className="text-[9px] uppercase tracking-wider text-ink-4 mt-0.5">
                        Active Workspace
                      </div>
                    </div>
                  </div>

                  <p className="text-[12px] text-ink-3 line-clamp-2 leading-relaxed">
                    {p.description || "No description provided."}
                  </p>
                </div>
              </Card>
            ))}

            {/* Add Project Card */}
            <Card
              onClick={() => {
                setErrors({});
                setName("");
                setDescription("");
                setShowModal(true);
              }}
              className="p-5 flex flex-col items-center justify-center border-dashed border border-line hover:border-ink-3 bg-surface-2 hover:bg-surface-3 cursor-pointer min-h-[140px] transition-colors rounded-[8px] shadow-none"
            >
              <span className="text-[20px] font-light text-ink-3">+</span>
              <span className="text-[13px] font-bold text-ink-2 mt-2">New Project</span>
            </Card>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card
            className="w-full max-w-sm p-5 bg-surface border border-line rounded-[8px] shadow-lg relative animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[15px] font-bold text-ink">New Project</h3>
                <p className="text-[11.5px] text-ink-3 mt-0.5">
                  Define a new workspace environment.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-4 hover:text-ink cursor-pointer p-0.5"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <Field label="Project name" error={errors.name}>
                <TextInput
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createProject.isPending}
                  autoFocus
                />
              </Field>

              <Field label="Description" error={errors.description}>
                <TextInput
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={createProject.isPending}
                />
              </Field>

              {createProject.isError && (
                <p className="rounded-[6px] bg-red-bg px-3 py-2 text-[12px] text-red font-medium">
                  {createProject.error instanceof ApiError
                    ? createProject.error.message
                    : "Could not create the project."}
                </p>
              )}

              <div className="flex justify-end gap-2.5 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  disabled={createProject.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Creating…" : "Create"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
