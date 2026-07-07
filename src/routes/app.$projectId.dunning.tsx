import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira } from "../lib/api";
import { PageHeader, Card, Badge, Button } from "../components/ui";
import { StateMachine } from "../features/billing/StateMachine";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/$projectId/dunning")({
  component: DunningPage,
});

function DunningPage() {
  const navigate = useNavigate();
  const { current } = useProjects();

  const { data: subs, isLoading } = useQuery({
    queryKey: ["subscriptions", current?.id],
    queryFn: () => subscribersApi.listSubscriptions(current!.id),
    enabled: !!current,
  });

  if (!current) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Dunning" subtitle="Recovery management." />
        <Card className="mt-6 p-12 text-center">
          <div className="text-[14px] font-semibold">No project selected</div>
          <div className="mt-5">
            <Button variant="primary" onClick={() => navigate({ to: "/app" })}>
              + New project
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const recovering = (subs ?? []).filter(
    (s) => s.status === "past_due" || s.status === "unpaid",
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Dunning"
        subtitle="Customers in recovery and the schedule chasing their payments."
      />

      <div>
        <StateMachine />
      </div>

      <h2 className="mb-3 mt-8 text-[14px] font-bold">In recovery</h2>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10 space-y-3">
            <div className="h-10 animate-pulse rounded-[8px] bg-surface-3" />
            <div className="h-10 animate-pulse rounded-[8px] bg-surface-3" />
          </div>
        ) : recovering.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-3">
            No customers in dunning right now.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line-2 bg-surface-2/40">
                {[
                  "Customer",
                  "Amount due",
                  "Attempt",
                  "Next retry",
                  "Access ends",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-3 last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recovering.map((s) => {
                const activeInvoice = s.invoices?.find(
                  (inv: any) => inv.status === "failed" || inv.status === "pending"
                );
                const attemptsList = activeInvoice?.paymentAttempts || [];
                const attemptCount = attemptsList.length;
                const attempt = Math.min(4, attemptCount + 1);

                let nextRetry = "Within 24 hours";
                if (attemptCount >= 3) {
                  nextRetry = "Exhausted";
                } else if (attemptsList.length > 0) {
                  const lastAttempt = [...attemptsList].sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )[0];
                  const nextDate = new Date(new Date(lastAttempt.createdAt).getTime() + 24 * 60 * 60 * 1000);
                  nextRetry = nextDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }

                const daysLeft = Math.max(0, 4 - attempt);
                const accessEnds =
                  daysLeft === 0
                    ? "Immediately"
                    : `In ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;

                return (
                  <tr
                    key={s.id}
                    className="border-t border-line-2 hover:bg-surface-2"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        to="/app/$projectId/subscribers/$id"
                        params={{ projectId: current!.id, id: s.id }}
                      >
                        <div className="text-[13px] font-semibold hover:text-yellow-deep">
                          {s.customer?.name}
                        </div>
                        <div className="text-[11px] text-ink-4">
                          {s.customer?.email}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold tnum">
                      {formatNaira(s.price?.unit_amount ?? 0)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={s.status === "past_due" ? "amber" : "red"}>
                        {attempt} of 4
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-2">
                      {nextRetry}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[13px] text-red font-medium">
                      {accessEnds}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
