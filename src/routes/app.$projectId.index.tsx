import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHeader } from "../components/ui";
import { useProjects } from "../components/ProjectContext";
import { subscribersApi, formatNaira } from "../lib/api";

export const Route = createFileRoute("/app/$projectId/")({
  component: ScopedDashboard,
});

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-[18px]">
      <div className="text-[12px] font-semibold text-ink-3 uppercase tracking-wider">{label}</div>
      <div className="mt-2.5 text-[28px] font-extrabold tracking-[-0.04em] tnum text-ink">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-ink-4 font-medium">
        {description}
      </div>
    </Card>
  );
}

function ScopedDashboard() {
  const navigate = useNavigate();
  const { projectId } = Route.useParams();
  const { current, setCurrent } = useProjects();

  // Load subscriptions for active project
  const { data: subs, isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions", projectId],
    queryFn: () => subscribersApi.listSubscriptions(projectId),
    enabled: !!projectId,
  });

  // Calculate dynamic metrics
  let totalActive = 0;
  let totalMrrKobo = 0;
  let totalDunning = 0;
  let totalChurn = 0;

  if (subs) {
    for (const sub of subs) {
      if (sub.status === "active" || sub.status === "trialing") {
        totalActive++;
        const interval = sub.price?.billing_interval || "month";
        const amount = sub.price?.unit_amount || 0;
        if (interval === "month") {
          totalMrrKobo += amount;
        } else if (interval === "year") {
          totalMrrKobo += Math.round(amount / 12);
        }
      } else if (sub.status === "past_due" || sub.status === "unpaid") {
        totalDunning++;
      } else if (sub.status === "canceled") {
        totalChurn++;
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={current?.name || "Dashboard"}
          subtitle="Recurring revenue and recovery performance metrics at a glance."
        />
        <button
          onClick={() => {
            setCurrent(null);
            navigate({ to: "/app" });
          }}
          className="h-8.5 px-3 border border-line-2 hover:border-line bg-surface hover:bg-surface-3 rounded-[6px] text-[12.5px] font-semibold text-ink-2 transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none select-none"
        >
          <span>Switch Project</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 opacity-60">
            <path d="m21 16-4 4-4-4M21 20H9M3 8l4-4 4 4M3 4h12" />
          </svg>
        </button>
      </div>

      {loadingSubs ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[14px] bg-surface-3" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric
            label="MRR"
            value={formatNaira(totalMrrKobo)}
            description="Monthly recurring revenue"
          />
          <Metric
            label="Active subscribers"
            value={totalActive.toString()}
            description="Active & trialing contracts"
          />
          <Metric
            label="In dunning"
            value={totalDunning.toString()}
            description="Failed payment recovery"
          />
          <Metric
            label="Churned"
            value={totalChurn.toString()}
            description="Total canceled contracts"
          />
        </div>
      )}

      {/* Monthly recurring revenue visual representation */}
      <Card className="p-6">
        <div className="text-[13px] font-semibold text-ink">Monthly recurring revenue</div>
        <div className="mt-5 flex h-[120px] items-end gap-1.5">
          {[40, 52, 48, 61, 58, 70, 66, 78, 74, 88, 92, 100].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-[4px] ${
                i >= 10 ? "bg-yellow" : "bg-cream"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
