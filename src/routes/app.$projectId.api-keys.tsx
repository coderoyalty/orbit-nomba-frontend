import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { ApiError } from "../lib/http";
import { PageHeader, Card, CopyField, Badge, Button } from "../components/ui";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/$projectId/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { current } = useProjects();
  const [confirmingRotation, setConfirmingRotation] = useState<"live" | "test" | null>(null);

  const gen = useMutation({
    mutationFn: (env: "live" | "test") => projectsApi.generateKeys(current!.id, env),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setConfirmingRotation(null);
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

  const liveKeyObj = current.apiKeys?.find((k) => k.key_prefix === "sk_live");
  const testKeyObj = current.apiKeys?.find((k) => k.key_prefix === "sk_test");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="API keys"
        subtitle={`Authenticate API requests from ${current.name}'s backend.`}
      />

      {/* Confirmation Dialog / Warning Modal */}
      {confirmingRotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fade-in">
          <Card className="w-full max-w-md p-6 shadow-2xl animate-slide-in">
            <h3 className="text-[15px] font-bold text-ink">
              Rotate {confirmingRotation === "live" ? "Live" : "Test"} API Key?
            </h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-3">
              Are you sure you want to rotate your{" "}
              <strong className="text-ink">
                {confirmingRotation === "live" ? "Live Mode" : "Test Mode"}
              </strong>{" "}
              API key? This will immediately revoke the current key, and any backend
              services using it will fail to authenticate until updated.
            </p>
            {gen.isError && (
              <p className="mt-3 rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[11px] font-semibold text-red">
                {gen.error instanceof ApiError ? gen.error.message : "Failed to rotate key."}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmingRotation(null);
                  gen.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="dark"
                disabled={gen.isPending}
                onClick={() => gen.mutate(confirmingRotation)}
              >
                {gen.isPending ? "Rotating..." : "Yes, rotate key"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Test Key Card */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold">Test API Key</span>
            <Badge tone="yellow">Test Mode</Badge>
          </div>
          {testKeyObj && (
            <span className="text-[11px] text-ink-4 font-medium select-none">
              Created on{" "}
              {new Date(testKeyObj.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {testKeyObj ? (
          <div className="space-y-4">
            <CopyField
              label="Secret key"
              value={testKeyObj.secret_key ?? `${testKeyObj.key_prefix}_••••••••••••••••••••••••`}
            />
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                onClick={() => setConfirmingRotation("test")}
              >
                Rotate Test Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-3">
              Generate a Test API key to authenticate integration tests in Test Mode.
            </p>
            {gen.isError && gen.variables === "test" && (
              <p className="rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-semibold text-red">
                {gen.error instanceof ApiError ? gen.error.message : "Could not generate test key."}
              </p>
            )}
            <Button
              variant="outline"
              disabled={gen.isPending && gen.variables === "test"}
              onClick={() => gen.mutate("test")}
            >
              {gen.isPending && gen.variables === "test" ? "Generating…" : "Generate Test Key"}
            </Button>
          </div>
        )}
      </Card>

      {/* Live Key Card */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold">Live API Key</span>
            <Badge tone="green">Live Mode</Badge>
          </div>
          {liveKeyObj && (
            <span className="text-[11px] text-ink-4 font-medium select-none">
              Created on{" "}
              {new Date(liveKeyObj.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {liveKeyObj ? (
          <div className="space-y-4">
            <CopyField
              label="Secret key"
              value={liveKeyObj.secret_key ?? `${liveKeyObj.key_prefix}_••••••••••••••••••••••••`}
            />
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                onClick={() => setConfirmingRotation("live")}
              >
                Rotate Live Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-3">
              Generate a Live API key to authenticate production requests in Live Mode.
            </p>
            {gen.isError && gen.variables === "live" && (
              <p className="rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-semibold text-red">
                {gen.error instanceof ApiError ? gen.error.message : "Could not generate live key."}
              </p>
            )}
            <Button
              variant="dark"
              disabled={gen.isPending && gen.variables === "live"}
              onClick={() => gen.mutate("live")}
            >
              {gen.isPending && gen.variables === "live" ? "Generating…" : "Generate Live Key"}
            </Button>
          </div>
        )}
      </Card>

      {/* Code Snippet Card */}
      <Card className="p-6">
        <h2 className="mb-1 text-[14px] font-bold">Create a checkout link</h2>
        <p className="mb-4 text-[13px] text-ink-3">
          Hit this API endpoint from your application backend to launch a hosted checkout session.
        </p>
        <pre className="overflow-x-auto rounded-[12px] bg-ink px-4 py-3.5 font-mono text-[11.5px] leading-[1.7] text-[#D4D4D4]">
          <span style={{ color: "#6B6B6B" }}>{"// create a checkout session"}</span>
          {"\n"}
          <span style={{ color: "#FFC105" }}>POST</span>{" "}
          <span style={{ color: "#8FBEFF" }}>/v1/checkout_sessions</span>
          {"\n"}
          {"{ "}
          <span style={{ color: "#9BE3B4" }}>"plan"</span>
          {": "}
          <span style={{ color: "#9BE3B4" }}>"plan_xxx"</span>
          {",\n"}
          {"  "}
          <span style={{ color: "#9BE3B4" }}>"customer"</span>
          {": "}
          <span style={{ color: "#9BE3B4" }}>"cus_xxx"</span>
          {" }"}
        </pre>
      </Card>
    </div>
  );
}
