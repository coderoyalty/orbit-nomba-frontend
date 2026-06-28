import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { ApiError } from "../lib/http";
import { PageHeader, Card, CopyField, Badge, Button } from "../components/ui";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const navigate = useNavigate();
  const { current } = useProjects();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const gen = useMutation({
    mutationFn: () => projectsApi.generateKeys(current!.id),
    onSuccess: (res) => {
      // backend returns the key once on generation
      setGeneratedKey(res?.key ?? res?.key_prefix ?? "key generated");
    },
  });

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="API keys" subtitle="Keys belong to a project." />
        <Card className="mt-6 p-12 text-center">
          <div className="text-[14px] font-semibold">No project selected</div>
          <div className="mt-5">
            <Button variant="primary" onClick={() => navigate({ to: "/app/projects/new" })}>
              + New project
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="API keys"
        subtitle={`Authenticate requests from ${current.name}'s backend.`}
      />

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold">Project API key</span>
          <Badge tone="green">Live mode</Badge>
        </div>

        {generatedKey ? (
          <>
            <CopyField label="Secret key (shown once)" value={generatedKey} />
            <div className="mt-4 rounded-[12px] border border-cream-2 bg-cream px-4 py-3.5 text-[12px] leading-relaxed text-yellow-ink">
              Copy this now — for security it won't be shown again. Store it on
              your server and never expose it in client-side code.
            </div>
          </>
        ) : (
          <>
            <p className="text-[13px] text-ink-3">
              Generate a key to authenticate this project's API requests. You can
              regenerate at any time, which revokes the previous key.
            </p>
            {gen.isError && (
              <p className="mt-3 rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-medium text-red">
                {gen.error instanceof ApiError ? gen.error.message : "Could not generate a key."}
              </p>
            )}
            <Button variant="primary" className="mt-4" disabled={gen.isPending} onClick={() => gen.mutate()}>
              {gen.isPending ? "Generating…" : "Generate API key"}
            </Button>
          </>
        )}
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="mb-1 text-[14px] font-bold">Create a checkout link</h2>
        <p className="mb-4 text-[13px] text-ink-3">Hit this from your app to start a subscription.</p>
        <pre className="overflow-x-auto rounded-[12px] bg-ink px-4 py-3.5 font-mono text-[11.5px] leading-[1.7] text-[#D4D4D4]">
<span style={{ color: "#6B6B6B" }}>{"// create a checkout session"}</span>{"\n"}
<span style={{ color: "#FFC105" }}>POST</span> <span style={{ color: "#8FBEFF" }}>/v1/checkout_sessions</span>{"\n"}
{"{ "}<span style={{ color: "#9BE3B4" }}>"plan"</span>{": "}<span style={{ color: "#9BE3B4" }}>"plan_xxx"</span>{",\n"}
{"  "}<span style={{ color: "#9BE3B4" }}>"customer"</span>{": "}<span style={{ color: "#9BE3B4" }}>"cus_xxx"</span>{" }"}
        </pre>
      </Card>
    </div>
  );
}
