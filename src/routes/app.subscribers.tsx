import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira, STATE_META } from "../lib/api";
import { PageHeader, Card, Badge } from "../components/ui";

export const Route = createFileRoute("/app/subscribers")({
  component: SubscribersPage,
});

function SubscribersPage() {
  const { data: subs, isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => subscribersApi.list(),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Subscribers"
        subtitle="Every customer and the state their access is in."
      />
      <Card className="mt-6 overflow-hidden">
        {isLoading ? (
          <div className="m-5 h-40 animate-pulse rounded-[10px] bg-surface-3" />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line-2">
                {["Customer", "Plan", "Amount", "State", "Renews"].map((h) => (
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
              {subs?.map((s) => {
                const meta = STATE_META[s.state];
                return (
                  <tr key={s.id} className="border-t border-line-2 transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3.5">
                      <Link to="/app/subscribers/$id" params={{ id: s.id }} className="block">
                        <div className="text-[13px] font-semibold text-ink hover:text-yellow-deep">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-ink-4">{s.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-2">{s.planName}</td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold tnum">
                      {formatNaira(s.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right text-[13px] text-ink-2">
                      {s.renews}
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
