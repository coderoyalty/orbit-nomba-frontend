import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira, STATE_META } from "../lib/api";
import { PageHeader, Card, Badge, Button } from "../components/ui";
import { Ledger } from "../features/billing/Ledger";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/subscribers/$id")({
  component: SubscriberDetail,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-b-0">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className="text-[13px] font-semibold text-ink">{children}</span>
    </div>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <div className="mx-auto max-w-xl mt-12 text-center">
        <Card className="p-10 flex flex-col items-center justify-center space-y-5 border border-line bg-surface">
          <div className="w-14 h-14 rounded-full bg-red-bg border border-red-line flex items-center justify-center text-[22px]">
            ⚠️
          </div>
          <div className="space-y-1.5">
            <h2 className="text-[16px] font-bold text-ink tracking-tight">Subscription not found</h2>
            <p className="max-w-sm mx-auto text-[12.5px] text-ink-3 leading-relaxed">
              We couldn't locate any subscription matching this identifier. It might have been deleted, or it belongs to a different environment.
            </p>
          </div>
          <div className="pt-2 w-full">
            <Link to="/app/subscribers">
              <Button variant="dark" block>
                Return to subscribers
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const meta = STATE_META[sub.status];
  const planName = sub.price?.plan?.name ?? "—";
  const amount = sub.price?.unit_amount ?? 0;

  // Banner details mapping
  let bannerColor = "bg-gray-bg border-gray-line text-gray";
  let bannerText = "";

  switch (sub.status) {
    case "active":
      bannerColor = "bg-green-bg border-green-line text-green";
      bannerText = `This subscription is currently active. The customer has full access and will be billed again on ${formatDate(sub.current_period_end)}.`;
      break;
    case "trialing":
      bannerColor = "bg-blue-bg border-blue-line text-blue";
      bannerText = `This subscription is in the trial phase. The trial is scheduled to end on ${formatDate(sub.trial_end)}, after which the payment card will be charged.`;
      break;
    case "past_due":
      bannerColor = "bg-amber-bg border-amber-line text-amber";
      bannerText = "A payment attempt failed. We are currently retrying billing according to the project's dunning schedule.";
      break;
    case "unpaid":
      bannerColor = "bg-red-bg border-red-line text-red";
      bannerText = "This subscription has failed all retry attempts and is unpaid. Service access should be suspended.";
      break;
    case "canceled":
      bannerColor = "bg-surface-3 border-line text-ink-3";
      bannerText = `This subscription was canceled on ${formatDate(sub.canceled_at)}. No further charges will be made.`;
      break;
    case "incomplete":
      bannerColor = "bg-cream border-yellow text-yellow-deep";
      bannerText = "Subscription setup has been initiated but the customer card has not yet been authorized. Awaiting checkout completion.";
      break;
  }

  // Parse customer metadata safely
  let customerMeta: Record<string, any> = {};
  if (sub.customer?.metadata) {
    try {
      customerMeta = typeof sub.customer.metadata === "string" 
        ? JSON.parse(sub.customer.metadata) 
        : sub.customer.metadata;
    } catch (err) {
      customerMeta = { raw: sub.customer.metadata };
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to="/app/subscribers"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-3 hover:text-ink transition-colors"
        >
          ← Back to subscribers
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <PageHeader
            title={sub.customer?.name || "Anonymous Customer"}
            subtitle={sub.customer?.email || ""}
            action={<Badge tone={meta?.tone ?? "gray"}>{meta?.label ?? sub.status}</Badge>}
          />
        </div>
      </div>

      {/* Status banner description */}
      <div className={`rounded-[12px] border px-4 py-3.5 text-[13px] leading-relaxed font-medium ${bannerColor}`}>
        {bannerText}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {/* Subscription configuration details */}
          <Card className="p-5">
            <h3 className="text-[13px] font-bold text-ink mb-1">Subscription Details</h3>
            <p className="text-[11.5px] text-ink-3 mb-3">Core subscription identifiers and product tiering.</p>
            <div className="divide-y divide-line-2">
              <Row label="Plan">
                {sub.price?.plan_id ? (
                  <Link
                    to="/app/plans"
                    search={{ planId: sub.price.plan_id }}
                    className="text-yellow-deep hover:underline font-semibold"
                  >
                    {planName}
                  </Link>
                ) : (
                  planName
                )}
              </Row>
              <Row label="Amount">
                <span className="tnum">{formatNaira(amount)}</span>
              </Row>
              <Row label="Subscription ID">
                <span className="font-mono text-[12px] text-ink-3 select-all">{sub.id}</span>
              </Row>
              <Row label="Environment">
                <Badge tone={sub.environment === "live" ? "green" : "yellow"}>
                  {sub.environment}
                </Badge>
              </Row>
            </div>
          </Card>

          {/* Lifecycle dates timeline */}
          <Card className="p-5">
            <h3 className="text-[13px] font-bold text-ink mb-1">Lifecycle Timestamps</h3>
            <p className="text-[11.5px] text-ink-3 mb-3">Timeline of periods, trials, and subscription actions.</p>
            <div className="divide-y divide-line-2">
              <Row label="Created at">{formatDate(sub.createdAt)}</Row>
              {sub.trial_start && (
                <Row label="Trial started">{formatDate(sub.trial_start)}</Row>
              )}
              {sub.trial_end && (
                <Row label="Trial ending">{formatDate(sub.trial_end)}</Row>
              )}
              {sub.current_period_start && (
                <Row label="Current period start">{formatDate(sub.current_period_start)}</Row>
              )}
              {sub.current_period_end && (
                <Row label="Current period end">{formatDate(sub.current_period_end)}</Row>
              )}
              {sub.canceled_at && (
                <Row label="Canceled at">{formatDate(sub.canceled_at)}</Row>
              )}
              {sub.cancel_at_period_end && (
                <Row label="Cancel at period end">Yes</Row>
              )}
            </div>
          </Card>

          {/* Subscribed Customer Profile & metadata */}
          <Card className="p-5">
            <h3 className="text-[13px] font-bold text-ink mb-1">Customer Profile</h3>
            <p className="text-[11.5px] text-ink-3 mb-3">Customer reference details and custom integration metadata.</p>
            <div className="divide-y divide-line-2">
              <Row label="Name">{sub.customer?.name || "—"}</Row>
              <Row label="Email">{sub.customer?.email || "—"}</Row>
              <Row label="Customer ID">
                <span className="font-mono text-[12px] text-ink-3 select-all">{sub.customer_id}</span>
              </Row>
            </div>
            {Object.keys(customerMeta).length > 0 && (
              <div className="mt-4">
                <span className="text-[11.5px] font-bold text-ink-3">Custom Metadata</span>
                <pre className="mt-2 overflow-x-auto rounded-[10px] border border-line bg-surface-2 p-3.5 font-mono text-[11.5px] text-ink-2 select-all leading-normal">
                  {JSON.stringify(customerMeta, null, 2)}
                </pre>
              </div>
            )}
          </Card>

          {/* Payment Method details */}
          <Card className="p-5">
            <h3 className="text-[13px] font-bold text-ink mb-1">Payment Method</h3>
            <p className="text-[11.5px] text-ink-3 mb-3">Authorized card token for automatic billing renewals.</p>
            {sub.paymentMethod ? (
              <div className="mt-4 relative overflow-hidden rounded-[16px] bg-gradient-to-br from-ink to-[#2b2b2b] p-6 text-white shadow-lg border border-line-2 min-h-[170px] flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                {/* Background glow effects */}
                <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-yellow/10 blur-xl pointer-events-none" />
                <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-yellow-deep/5 blur-xl pointer-events-none" />

                <div className="flex justify-between items-start">
                  {/* SIM Chip Illustration */}
                  <div className="w-10 h-7 rounded-[4px] bg-gradient-to-r from-yellow-deep/60 to-yellow/40 border border-yellow/40 relative overflow-hidden flex flex-col justify-between p-1">
                    <div className="flex justify-between w-full h-[1px] bg-yellow/20" />
                    <div className="flex justify-between w-full h-[1px] bg-yellow/20" />
                    <div className="flex justify-between w-full h-[1px] bg-yellow/20" />
                  </div>
                  
                  {/* Card Brand */}
                  <div className="text-[12px] font-black tracking-widest text-white/95 bg-white/10 px-2.5 py-1 rounded-[6px] uppercase border border-white/10 select-none">
                    {sub.paymentMethod.brand}
                  </div>
                </div>

                {/* Card Number */}
                <div className="my-4 font-mono text-[16px] tracking-[0.18em] text-white/90 text-center select-all">
                  •••• •••• •••• {sub.paymentMethod.last4}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">Card Holder</div>
                    <div className="text-[12px] font-bold text-white/95 mt-0.5 max-w-[160px] truncate">
                      {sub.customer?.name || "Cardholder"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">Added</div>
                    <div className="text-[11.5px] font-bold text-white/90 mt-0.5">
                      {new Date(sub.paymentMethod.createdAt).toLocaleDateString("en-GB", {
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[12px] text-ink-3 bg-surface-2 border border-line p-3 rounded-[10px] text-center font-medium">
                No payment card is currently linked.
              </div>
            )}
          </Card>
        </div>

        {/* Ledger panel */}
        <div>
          <Ledger showRefund />
        </div>
      </div>
    </div>
  );
}
