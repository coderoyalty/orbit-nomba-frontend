import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { plansApi, formatNaira, priceLabel } from "../lib/api";
import { PageHeader, Button, Badge, Card } from "../components/ui";
import { PlanBuilder } from "../features/plans/PlanBuilder";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/plans")({
  component: PlansPage,
});

function PlansPage() {
  const navigate = useNavigate();
  const { current } = useProjects();
  const [building, setBuilding] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans", current?.id],
    queryFn: () => plansApi.list(current!.id),
    enabled: !!current,
  });

  // No project selected → can't scope plans.
  if (!current) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Plans" subtitle="Plans live under a project." />
        <Card className="mt-6 p-12 text-center">
          <div className="text-[14px] font-semibold">No project selected</div>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-3">
            Create or select a project first — plans, keys, and subscriptions all
            belong to a project.
          </p>
          <div className="mt-5">
            <Button variant="primary" onClick={() => navigate({ to: "/app/projects/new" })}>
              + New project
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Plans"
        subtitle={`What ${current.name} sells, the price, and how often you charge it.`}
        action={
          !building ? (
            <Button variant="primary" onClick={() => setBuilding(true)}>
              + New plan
            </Button>
          ) : undefined
        }
      />

      <div className="mt-6">
        {building ? (
          <Card className="p-6">
            <h2 className="mb-1 text-[16px] font-bold tracking-[-0.02em]">Create a plan</h2>
            <p className="mb-6 text-[13px] text-ink-3">
              Plans are the building block of subscriptions.
            </p>
            <PlanBuilder projectId={current.id} onDone={() => setBuilding(false)} />
          </Card>
        ) : isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-[14px] bg-surface-3" />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <Card className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line-2">
                  {["Plan", "Price", "Interval", "Status"].map((h) => (
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
                {plans.map((p) => {
                  const price = p.prices?.find((pr) => pr.is_active) ?? p.prices?.[0];
                  return (
                    <tr key={p.id} className="border-t border-line-2 first:border-t-0">
                      <td className="px-4 py-3.5">
                        <div className="text-[13px] font-semibold">{p.name}</div>
                        <div className="text-[11px] text-ink-4">{p.description || p.id}</div>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-semibold tnum">
                        {price ? formatNaira(price.unit_amount) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-ink-2">
                        {priceLabel(price)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge tone={p.is_active ? "green" : "gray"}>
                          {p.is_active ? "Active" : "Archived"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-[14px] font-semibold">No plans yet</div>
            <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-3">
              Create your first plan to start accepting subscriptions.
            </p>
            <div className="mt-5">
              <Button variant="primary" onClick={() => setBuilding(true)}>
                + New plan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
