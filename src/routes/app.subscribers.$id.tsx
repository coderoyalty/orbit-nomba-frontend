import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira, STATE_META } from "../lib/api";
import { PageHeader, Card, Badge } from "../components/ui";
import { Ledger } from "../features/billing/Ledger";

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
  const { data: sub, isLoading } = useQuery({
    queryKey: ["subscriber", id],
    queryFn: () => subscribersApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-64 animate-pulse rounded-[14px] bg-surface-3" />
      </div>
    );
  }
  if (!sub) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-[14px] text-ink-3">Subscriber not found.</p>
        <Link to="/app/subscribers" className="text-[13px] font-semibold text-yellow-deep">
          ← Back to subscribers
        </Link>
      </div>
    );
  }

  const meta = STATE_META[sub.state];

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/app/subscribers"
        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-ink"
      >
        ← Subscribers
      </Link>
      <PageHeader
        title={sub.name}
        subtitle={sub.email}
        action={<Badge tone={meta.tone}>{meta.label}</Badge>}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold">Subscription</h2>
            <div className="mt-2 divide-y divide-line-2">
              <Row label="Plan">{sub.planName}</Row>
              <Row label="Amount">
                <span className="tnum">{formatNaira(sub.amount)}</span>
              </Row>
              <Row label="Renews">{sub.renews}</Row>
              <Row label="Customer ID">
                <span className="font-mono text-[12px] text-ink-3">{sub.id}</span>
              </Row>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[13px] font-semibold">Payment method</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-6 w-9 place-items-center rounded-[5px] bg-surface-3 text-[8px] font-extrabold text-ink-2">
                {sub.card.brand}
              </div>
              <div>
                <div className="text-[13px] font-semibold">•••• {sub.card.last4}</div>
                <div className="text-[11px] text-ink-4">Expires {sub.card.expiry}</div>
              </div>
            </div>
          </Card>

          {sub.dunning && (
            <Card className="border-amber-bg p-5">
              <div className="mb-2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
                <span className="text-[13px] font-bold text-amber">In dunning</span>
              </div>
              <div className="divide-y divide-line-2">
                <Row label="Retry attempt">
                  {sub.dunning.attempt} of {sub.dunning.of}
                </Row>
                <Row label="Next retry">{sub.dunning.nextRetry}</Row>
                <Row label="Access ends">
                  <span className="text-red">{sub.dunning.accessEnds}</span>
                </Row>
              </div>
            </Card>
          )}
        </div>

        {/* Per-subscriber ledger with the manual-refund action */}
        <Ledger showRefund />
      </div>
    </div>
  );
}
