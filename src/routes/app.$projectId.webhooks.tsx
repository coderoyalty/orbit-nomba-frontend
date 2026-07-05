import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhooksApi, devApi, type WebhookStatus, type AddWebhookInput, type WebhookEndpoint } from "../lib/api";
import { PageHeader, Card, Badge, Button, Field, TextInput } from "../components/ui";
import { useToast } from "../components/Toast";
import { ApiError } from "../lib/http";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/$projectId/webhooks")({
  component: WebhooksPage,
});

const DOT: Record<WebhookStatus, string> = {
  "200": "bg-green",
  retry: "bg-amber",
  failed: "bg-red",
};

function statusLabel(s: WebhookStatus, when: string) {
  if (s === "200") return `200 · ${when}`;
  if (s === "retry") return `retry · ${when}`;
  return `failed · ${when}`;
}

function WebhookForm({
  env,
  webhook,
  projectId,
  active,
}: {
  env: "live" | "test";
  webhook?: WebhookEndpoint;
  projectId: string;
  active: boolean;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [signingSecret, setSigningSecret] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync inputs with database settings once loaded
  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url);
      setSigningSecret(webhook.signing_secret);
    } else {
      setUrl("");
      setSigningSecret("");
    }
    setErrors({});
  }, [webhook]);

  const saveWebhook = useMutation({
    mutationFn: (body: AddWebhookInput) => webhooksApi.upsert(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints", projectId] });
      toast(`${env === "live" ? "Live" : "Test"} webhook settings saved successfully.`, "success");
    },
    onError: (err: any) => {
      toast(err instanceof ApiError ? err.message : "Failed to save settings.", "error");
    },
  });

  const handleGenerateSecret = () => {
    const chars = "abcdef0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    setSigningSecret(token);
  };

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    if (!url.trim()) {
      nextErrors.url = "Endpoint URL is required.";
    } else if (!/^https?:\/\//.test(url.trim())) {
      nextErrors.url = "URL must begin with http:// or https://";
    }

    if (!signingSecret.trim()) {
      nextErrors.signingSecret = "Signing secret is required.";
    } else if (signingSecret.trim().length < 5) {
      nextErrors.signingSecret = "Secret must be at least 5 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveWebhook.mutate({
      url: url.trim(),
      signing_secret: signingSecret.trim(),
      environment: env,
    });
  };

  return (
    <Card className={`p-6 space-y-4 transition-all duration-200 border rounded-[8px] shadow-none ${
      active 
        ? "border-yellow bg-surface ring-1 ring-yellow/20" 
        : "border-line bg-surface-2 opacity-80 hover:opacity-100"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-bold text-ink capitalize">{env} Webhook Settings</h2>
          {active && (
            <span className="text-[9px] font-bold text-yellow-deep bg-cream px-1.5 py-0.5 rounded-[4px] border border-yellow/10 select-none">
              Active Mode
            </span>
          )}
        </div>
        <Badge tone={env === "live" ? "green" : "amber"}>
          {env === "live" ? "Live" : "Test"}
        </Badge>
      </div>

      <p className="text-[12px] text-ink-3 leading-relaxed">
        {env === "live"
          ? "Configure endpoint URL and secret to receive live subscription events."
          : "Configure endpoint URL and secret to receive test sandbox customer events."}
      </p>

      <div className="space-y-4 pt-2">
        <Field
          label="Endpoint URL"
          error={errors.url}
          hint={`Orbit will send POST requests to this URL for all ${env} environment billing events.`}
        >
          <TextInput
            type="text"
            placeholder="https://api.yourcompany.com/v1/webhooks/orbit"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={saveWebhook.isPending}
          />
        </Field>

        <Field
          label="Signing Secret"
          error={errors.signingSecret}
          hint="Secret key used to verify HMAC-SHA256 signature headers."
        >
          <div className="flex gap-2">
            <TextInput
              type="text"
              placeholder="Enter custom key or click Generate"
              value={signingSecret}
              onChange={(e) => setSigningSecret(e.target.value)}
              disabled={saveWebhook.isPending}
              className="font-mono text-[12px]"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateSecret}
              disabled={saveWebhook.isPending}
              className="flex-shrink-0"
            >
              Generate
            </Button>
          </div>
        </Field>

        <div className="pt-2 flex justify-end">
          <Button
            variant={active ? "primary" : "dark"}
            onClick={handleSave}
            disabled={saveWebhook.isPending}
          >
            {saveWebhook.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function WebhooksPage() {
  const { projectId } = Route.useParams();

  // Load all project webhook endpoints
  const { data: webhooks, isLoading: loadingEndpoints } = useQuery({
    queryKey: ["webhook-endpoints", projectId],
    queryFn: () => webhooksApi.list(projectId),
  });

  const { activeEnv } = useProjects();

  const testWebhook = webhooks?.find((w) => w.environment === "test");
  const liveWebhook = webhooks?.find((w) => w.environment === "live");

  // Load recent simulated events
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["webhook-events"],
    queryFn: devApi.events,
  });

  // Render both forms, sorting the currently active environment to the top of the stack
  const forms = [
    <WebhookForm
      key="test"
      env="test"
      webhook={testWebhook}
      projectId={projectId}
      active={activeEnv === "test"}
    />,
    <WebhookForm
      key="live"
      env="live"
      webhook={liveWebhook}
      projectId={projectId}
      active={activeEnv === "live"}
    />,
  ];

  const orderedForms = [...forms].sort((a, b) => {
    const aActive = a.props.active ? 1 : 0;
    const bActive = b.props.active ? 1 : 0;
    return bActive - aActive;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Webhooks"
        subtitle="Orbit signs subscription and invoice payloads so your application server can verify they are authentic."
      />

      <div className="grid gap-6 md:grid-cols-5 mt-6">
        {/* Ordered Forms Stack */}
        <div className="md:col-span-3 space-y-5">
          {loadingEndpoints ? (
            <div className="space-y-5">
              {[1, 2].map((i) => (
                <div key={i} className="h-72 animate-pulse bg-surface-3 rounded-[8px]" />
              ))}
            </div>
          ) : (
            orderedForms
          )}
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 rounded-[8px]">
            <h2 className="mb-3 text-[14px] font-bold text-ink">Subscribable events</h2>
            <div className="flex flex-wrap gap-1.5">
              {[
                "subscription.active",
                "subscription.past_due",
                "subscription.canceled",
                "subscription.unpaid",
                "invoice.paid",
                "invoice.payment_failed",
              ].map((ev) => (
                <span
                  key={ev}
                  className="rounded-[6px] bg-surface-3 px-2.5 py-1 font-mono text-[11px] text-ink-2 select-none border border-line"
                >
                  {ev}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-ink-4">
              Payload requests are signed with your secret using standard HMAC-SHA256 headers (`X-Orbit-Signature`).
            </p>
          </Card>

          {/* Simulated deliveries */}
          <Card className="overflow-hidden rounded-[8px]">
            <div className="flex items-center justify-between border-b border-line-2 px-5 py-3 bg-surface-2">
              <span className="text-[12.5px] font-bold text-ink">Simulated deliveries</span>
              <Badge tone="green">online</Badge>
            </div>
            {loadingEvents ? (
              <div className="m-5 h-20 animate-pulse rounded-[10px] bg-surface-3" />
            ) : (
              <div className="py-1">
                {events?.map((e) => (
                  <div key={e.id} className="flex items-center gap-2.5 px-5 py-2.5 hover:bg-surface-3 transition-colors">
                    <span className={`h-1.5 w-1.5 rounded-full ${DOT[e.status]}`} />
                    <span className="font-mono text-[11px] text-ink">{e.event}</span>
                    <span className="ml-auto text-[10.5px] text-ink-4">
                      {statusLabel(e.status, e.when)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
