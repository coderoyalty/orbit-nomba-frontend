import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira, STATE_META } from "../lib/api";
import { PageHeader, Card, Badge } from "../components/ui";
import { Ledger } from "../features/billing/Ledger";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/subscribers/$id")({
  component: SubscriberDetail,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className="text-[13px] font-semibold">{children}</span>
    </div>
  );
}

function SubscriberDetail() {
  const { id } = Route.useParams();
  const { current } = useProjects();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions", current?.id],
    queryFn: () => subscribersApi.listSubscriptions(current!.id),
    enabled: !!current,
  });

  if (!current) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-[14px] text-ink-3">No active project selected.</p>
        <Link to="/app/subscribers" className="text-[13px] font-semibold text-yellow-deep">
          ← Back to subscribers
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-64 animate-pulse rounded-[14px] bg-surface-3" />
      </div>
    );
  }

  const sub = subscriptions?.find((s) => s.id === id);

  if (!sub) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-[14px] text-ink-3">Subscription not found.</p>
        <Link to="/app/subscribers" className="text-[13px] font-semibold text-yellow-deep">
          ← Back to subscribers
        </Link>
      </div>
    );
  }

  const meta = STATE_META[sub.status];
  const planName = sub.price?.plan?.name ?? "—";
  const amount = sub.price?.unit_amount ?? 0;
  const renews = sub.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/app/subscribers"
        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-ink"
      >
        ← Subscribers
      </Link>
      <PageHeader
        title={sub.customer?.name || "Anonymous Customer"}
        subtitle={sub.customer?.email || ""}
        action={<Badge tone={meta?.tone ?? "gray"}>{meta?.label ?? sub.status}</Badge>}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold">Subscription</h2>
            <div className="mt-2 divide-y divide-line-2">
              <Row label="Plan">{planName}</Row>
              <Row label="Amount">
                <span className="tnum">{formatNaira(amount)}</span>
              </Row>
              <Row label="Renews">{renews}</Row>
              <Row label="Subscription ID">
                <span className="font-mono text-[12px] text-ink-3">{sub.id}</span>
              </Row>
              <Row label="Customer ID">
                <span className="font-mono text-[12px] text-ink-3">{sub.customer_id}</span>
              </Row>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[13px] font-semibold">Payment method</h2>
            {sub.paymentMethod ? (
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-6 w-9 place-items-center rounded-[5px] bg-surface-3 text-[8px] font-extrabold text-ink-2 uppercase">
                  {sub.paymentMethod.brand}
                </div>
                <div>
                  <div className="text-[13px] font-semibold">•••• {sub.paymentMethod.last4}</div>
                  <div className="text-[11px] text-ink-4">
                    Added {new Date(sub.paymentMethod.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[12px] text-ink-3">No payment method on file.</div>
            )}
          </Card>
        </div>

        {/* Per-subscriber ledger with the manual-refund action */}
        <Ledger showRefund />
      </div>
    </div>
  );
}
