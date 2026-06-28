import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira } from "../lib/api";
import { PageHeader, Card, Badge } from "../components/ui";
import { StateMachine } from "../features/billing/StateMachine";

export const Route = createFileRoute("/app/dunning")({
  component: DunningPage,
});

function DunningPage() {
  const { data: subs } = useQuery({ queryKey: ["subscribers"], queryFn: () => subscribersApi.list() });
  const recovering = (subs ?? []).filter((s) => s.state === "past_due" || s.state === "unpaid");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Dunning"
        subtitle="Customers in recovery and the schedule that's chasing their payments."
      />

      <div className="mt-6">
        <StateMachine />
      </div>

      <h2 className="mb-3 mt-8 text-[14px] font-bold">In recovery</h2>
      <Card className="overflow-hidden">
        {recovering.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-3">
            No customers in dunning right now.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line-2">
                {["Customer", "Amount due", "Attempt", "Next retry", "Access ends"].map((h) => (
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
              {recovering.map((s) => (
                <tr key={s.id} className="border-t border-line-2 hover:bg-surface-2">
                  <td className="px-4 py-3.5">
                    <Link to="/app/subscribers/$id" params={{ id: s.id }}>
                      <div className="text-[13px] font-semibold hover:text-yellow-deep">{s.name}</div>
                      <div className="text-[11px] text-ink-4">{s.email}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold tnum">{formatNaira(s.amount)}</td>
                  <td className="px-4 py-3.5">
                    {s.dunning ? (
                      <Badge tone="amber">{s.dunning.attempt} of {s.dunning.of}</Badge>
                    ) : (
                      <Badge tone="red">exhausted</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-ink-2">{s.dunning?.nextRetry ?? "—"}</td>
                  <td className="px-4 py-3.5 text-right text-[13px] text-red">{s.dunning?.accessEnds ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
