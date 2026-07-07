import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi, formatNaira, STATE_META } from "../lib/api";
import { PageHeader, Card, Badge, Button } from "../components/ui";
import { useProjects } from "../components/ProjectContext";

export const Route = createFileRoute("/app/$projectId/subscribers/")({
  component: SubscribersPage,
});

type Tab = "subscriptions" | "customers";

function SubscribersPage() {
  const navigate = useNavigate();
  const { current } = useProjects();
  const [activeTab, setActiveTab] = useState<Tab>("subscriptions");

  const { data: subscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions", current?.id],
    queryFn: () => subscribersApi.listSubscriptions(current!.id),
    enabled: !!current,
  });

  const { data: customers, isLoading: loadingCusts } = useQuery({
    queryKey: ["customers", current?.id],
    queryFn: () => subscribersApi.listCustomers(current!.id),
    enabled: !!current,
  });

  if (!current) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Subscribers"
          subtitle="Subscribers live under a project."
        />
        <Card className="mt-6 p-12 text-center">
          <div className="text-[14px] font-semibold">No project selected</div>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-3">
            Create or select a project first — customers, plans, and
            subscriptions all belong to a project.
          </p>
          <div className="mt-5">
            <Button variant="primary" onClick={() => navigate({ to: "/app" })}>
              + New project
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isLoading = activeTab === "subscriptions" ? loadingSubs : loadingCusts;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Subscribers"
        subtitle={`Every customer and subscription under ${current.name}.`}
      />

      {/* Tabs */}
      <div className="mt-6 flex border-b border-line-2">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 text-[13.5px] font-semibold transition-colors border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === "subscriptions"
              ? "border-yellow text-ink font-bold"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          Subscriptions ({subscriptions?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2.5 text-[13.5px] font-semibold transition-colors border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === "customers"
              ? "border-yellow text-ink font-bold"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          Customers ({customers?.length ?? 0})
        </button>
      </div>

      <Card className="mt-4 overflow-hidden">
        {isLoading ? (
          <div className="m-5 h-40 animate-pulse rounded-[10px] bg-surface-3" />
        ) : activeTab === "subscriptions" ? (
          subscriptions && subscriptions.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line-2 bg-surface-2/40">
                  {["Customer", "Plan", "Amount", "Status", "Renews/Ends"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-3 last:text-right"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => {
                  const meta = STATE_META[s.status];
                  const amount = s.price?.unit_amount ?? 0;
                  const planName = s.price?.plan?.name ?? "—";
                  const renews = s.current_period_end
                    ? new Date(s.current_period_end).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "—";
                  return (
                    <tr
                      key={s.id}
                      onClick={() =>
                        navigate({
                          to: "/app/$projectId/subscribers/$id",
                          params: { projectId: current!.id, id: s.id },
                        })
                      }
                      className="border-t border-line-2 first:border-t-0 hover:bg-surface-2 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="text-[13px] font-semibold text-ink">
                          {s.customer?.name || "Anonymous"}
                        </div>
                        <div className="text-[11px] text-ink-4">
                          {s.customer?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-ink-2">
                        {planName}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-semibold tnum">
                        {formatNaira(amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={meta?.tone ?? "gray"}>
                          {meta?.label ?? s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] text-ink-2 tnum">
                        {renews}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-ink-3 text-[13px]">
              No subscriptions found.
            </div>
          )
        ) : customers && customers.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line-2 bg-surface-2/40">
                {["Name", "Email", "Env", "Status", "Created At"].map((h) => (
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
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-line-2 first:border-t-0 hover:bg-surface-2 transition-colors"
                >
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-ink">
                    {c.name}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-ink-2">
                    {c.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={c.environment === "live" ? "green" : "yellow"}>
                      {c.environment}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={c.is_active ? "green" : "gray"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[13px] text-ink-2 tnum">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-ink-3 text-[13px]">
            No customers found.
          </div>
        )}
      </Card>
    </div>
  );
}
