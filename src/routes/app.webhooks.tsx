import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { devApi, type WebhookStatus } from "../lib/api";
import { PageHeader, Card, Badge } from "../components/ui";

export const Route = createFileRoute("/app/webhooks")({
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

function WebhooksPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["webhook-events"],
    queryFn: devApi.events,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Webhooks"
        subtitle="We sign every event so your backend can trust it, then unlock features for your users."
      />

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line-2 px-5 py-3.5">
          <span className="text-[13px] font-semibold">Recent events</span>
          <Badge tone="green">delivering</Badge>
        </div>
        {isLoading ? (
          <div className="m-5 h-32 animate-pulse rounded-[10px] bg-surface-3" />
        ) : (
          <div className="py-1.5">
            {events?.map((e) => (
              <div key={e.id} className="flex items-center gap-2.5 px-5 py-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[e.status]}`} />
                <span className="font-mono text-[11.5px] text-ink">{e.event}</span>
                <span className="ml-auto text-[11px] text-ink-4">
                  {statusLabel(e.status, e.when)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="mb-3 text-[14px] font-bold">Events you can subscribe to</h2>
        <div className="flex flex-wrap gap-2">
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
              className="rounded-[8px] bg-surface-3 px-2.5 py-1 font-mono text-[11.5px] text-ink-2"
            >
              {ev}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-ink-4">
          Webhook endpoints and signing secrets are configured per project. This
          surface lights up once the backend's webhook endpoints ship.
        </p>
      </Card>
    </div>
  );
}
