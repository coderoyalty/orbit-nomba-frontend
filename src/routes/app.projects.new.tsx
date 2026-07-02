import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi, type Project } from "../lib/api";
import { ApiError } from "../lib/http";
import { PageHeader, Card, Field, TextInput, Button } from "../components/ui";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { setCurrent } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: (body: { name: string; description: string }) =>
      projectsApi.create(body),
    onSuccess: (project: Project) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setCurrent(project);
      navigate({ to: "/app/plans" });
    },
  });

  function submit() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Project name needs at least 2 characters.";
    if (!description.trim()) next.description = "Add a short description.";
    setErrors(next);
    if (Object.keys(next).length) return;
    create.mutate({ name: name.trim(), description: description.trim() });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New project"
        subtitle="A project is one app you're billing for. Plans, keys, customers, and subscriptions all live under it."
      />
      <Card className="mt-6 p-6">
        <div className="space-y-5">
          <Field label="Project name" error={errors.name}>
            <TextInput
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <TextInput
              placeholder="Enter project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          {create.isError && (
            <p className="rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-medium text-red">
              {create.error instanceof ApiError
                ? create.error.message
                : "Could not create the project. Try again."}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="primary" onClick={submit} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create project"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/app/projects" })}
              disabled={create.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
