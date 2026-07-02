import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  plansApi,
  formatNaira,
  priceLabel,
  nairaToKobo,
  koboToNaira,
  type Price,
} from "../lib/api";
import { PageHeader, Button, Badge, Card, Field, TextInput, AlertDialog } from "../components/ui";
import { PlanBuilder } from "../features/plans/PlanBuilder";
import { useProjects } from "../components/ProjectContext";
import { useToast } from "../components/Toast";

type PlanBillingChoice = "monthly" | "annual" | "weekly" | "custom";

const CHOICES: { value: PlanBillingChoice; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
];

export const Route = createFileRoute("/app/plans")({
  component: PlansPage,
});

function PlansPage() {
  const navigate = useNavigate();
  const { current } = useProjects();
  const [building, setBuilding] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

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
                <tr className="border-b border-line-2 bg-surface-2/40">
                  {["Plan", "Price", "Interval", "Trial Period", "Status"].map((h) => (
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
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className="border-t border-line-2 first:border-t-0 hover:bg-surface-2 cursor-pointer transition-colors"
                    >
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
                      <td className="px-4 py-3.5 text-[13px] text-ink-2">
                        {p.trial_days > 0 ? `${p.trial_days} day${p.trial_days > 1 ? "s" : ""}` : "—"}
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

      {/* Side Drawer Overlay & Drawer */}
      {selectedPlanId && (
        <>
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40 animate-fade-in"
            onClick={() => setSelectedPlanId(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-surface border-l border-line-2 shadow-2xl z-50 overflow-y-auto p-6 animate-slide-in">
            <PlanDetailsDrawer
              projectId={current.id}
              planId={selectedPlanId}
              onClose={() => setSelectedPlanId(null)}
              setConfirmDialog={setConfirmDialog}
            />
          </div>
        </>
      )}

      {confirmDialog && (
        <AlertDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          variant="danger"
        />
      )}
    </div>
  );
}

function PlanDetailsDrawer({
  projectId,
  planId,
  onClose,
  setConfirmDialog,
}: {
  projectId: string;
  planId: string;
  onClose: () => void;
  setConfirmDialog: (config: { open: boolean; title: string; description: string; onConfirm: () => void } | null) => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["plan", projectId, planId],
    queryFn: () => plansApi.get(projectId, planId),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Edit Metadata Mutation
  const updateMetadata = useMutation({
    mutationFn: () => plansApi.update(projectId, planId, { name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans", projectId] });
      qc.invalidateQueries({ queryKey: ["plan", projectId, planId] });
      toast("Plan updated successfully", "success");
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to update plan", "error");
    },
  });

  // Keep fields synced with loaded plan details
  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description || "");
    }
  }, [plan]);

  // Price addition state
  const [addingPrice, setAddingPrice] = useState(false);
  const [priceAmount, setPriceAmount] = useState("");
  const [priceChoice, setPriceChoice] = useState<PlanBillingChoice>("monthly");
  const [priceCustomCount, setPriceCustomCount] = useState("1");
  const [priceCustomUnit, setPriceCustomUnit] = useState<"day" | "week" | "month" | "year">("month");

  const addPriceMutation = useMutation({
    mutationFn: () => {
      let interval: "day" | "week" | "month" | "year" = "month";
      let interval_count = 1;

      if (priceChoice === "monthly") {
        interval = "month";
        interval_count = 1;
      } else if (priceChoice === "annual") {
        interval = "year";
        interval_count = 1;
      } else if (priceChoice === "weekly") {
        interval = "week";
        interval_count = 1;
      } else if (priceChoice === "custom") {
        interval = priceCustomUnit;
        interval_count = Number(priceCustomCount);
      }

      const amountNaira = Number(priceAmount);
      return plansApi.addPrice(projectId, planId, {
        interval,
        interval_count,
        unit_amount: nairaToKobo(amountNaira),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans", projectId] });
      qc.invalidateQueries({ queryKey: ["plan", projectId, planId] });
      toast("Price added successfully", "success");
      setAddingPrice(false);
      setPriceAmount("");
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to add price", "error");
    },
  });

  // Archive price state / mutation
  const archivePriceMutation = useMutation({
    mutationFn: (priceId: string) => plansApi.archivePrice(projectId, planId, priceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans", projectId] });
      qc.invalidateQueries({ queryKey: ["plan", projectId, planId] });
      toast("Price archived successfully", "success");
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to archive price", "error");
    },
  });

  // Change price amount state / mutation (opens small prompt/field)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceAmount, setEditPriceAmount] = useState("");

  const changePriceMutation = useMutation({
    mutationFn: (priceId: string) => {
      const amountNaira = Number(editPriceAmount);
      return plansApi.changePrice(projectId, planId, priceId, {
        unit_amount: nairaToKobo(amountNaira),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans", projectId] });
      qc.invalidateQueries({ queryKey: ["plan", projectId, planId] });
      toast("Price updated successfully", "success");
      setEditingPriceId(null);
      setEditPriceAmount("");
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to update price", "error");
    },
  });

  // Danger actions: cancel subscriptions & deprecate
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cancelSubsMutation = useMutation({
    mutationFn: () => plansApi.cancelSubscriptions(projectId, planId),
    onSuccess: () => {
      toast("All subscriptions for this plan have been scheduled for cancellation", "success");
      setConfirmCancel(false);
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to cancel subscriptions", "error");
    },
  });

  const deprecateMutation = useMutation({
    mutationFn: () => plansApi.remove(projectId, planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans", projectId] });
      toast("Plan deprecated successfully", "success");
      onClose();
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to deprecate plan", "error");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow border-t-transparent" />
        <span className="mt-2 text-[13px] text-ink-3 font-semibold">Loading plan details...</span>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <div className="text-[14px] font-semibold text-red">Failed to load plan details</div>
        <Button className="mt-4" onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-2 pb-4 mb-6">
          <div>
            <h2 className="text-[18px] font-extrabold tracking-[-0.03em]">{plan.name}</h2>
            <p className="text-[11px] font-mono text-ink-4 uppercase tracking-[0.05em]">{plan.id}</p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink text-[18px] font-bold p-1">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6">
          {/* Metadata Section */}
          <Card className="p-4 space-y-4">
            <h3 className="text-[13px] font-bold text-ink-2">Plan Details</h3>
            <Field label="Name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description">
              <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            {plan.trial_days > 0 && (
              <div className="text-[12.5px] text-ink-3 bg-surface-2 p-2.5 rounded-[8px] border border-line-2/60">
                <span className="font-semibold text-ink-2">Trial Period:</span> {plan.trial_days} day{plan.trial_days > 1 ? "s" : ""}
              </div>
            )}
            <Button
              variant="dark"
              size="sm"
              onClick={() => updateMetadata.mutate()}
              disabled={updateMetadata.isPending || !name.trim()}
            >
              {updateMetadata.isPending ? "Saving..." : "Save details"}
            </Button>
          </Card>

          {/* Pricing Section */}
          <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-ink-2">Prices</h3>
              {!addingPrice && (
                <Button variant="default" size="sm" onClick={() => setAddingPrice(true)}>
                  + Add price
                </Button>
              )}
            </div>

            {/* Add Price Form */}
            {addingPrice && (
              <div className="bg-surface-2 p-3.5 rounded-[10px] border border-line space-y-4">
                <h4 className="text-[12px] font-bold text-ink-2">New Price</h4>
                <Field label="Amount (NGN)">
                  <div className="flex items-center rounded-[10px] border border-line bg-surface px-3.5 focus-within:border-yellow">
                    <span className="text-[14px] font-semibold text-ink-3">₦</span>
                    <input
                      inputMode="numeric"
                      placeholder="Enter amount"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value.replace(/[^\d]/g, ""))}
                      className="w-full bg-transparent px-2 py-2 text-[13px] tnum text-ink placeholder:text-ink-4 focus:outline-none"
                    />
                  </div>
                </Field>
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-ink-3">Interval</span>
                  <div className="grid grid-cols-4 gap-2">
                    {CHOICES.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriceChoice(opt.value)}
                        className={`rounded-[8px] border px-1 py-1.5 text-center text-[12px] transition-colors ${
                          priceChoice === opt.value ? "border-yellow bg-cream text-yellow-ink font-bold" : "border-line bg-surface hover:bg-surface-2"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {priceChoice === "custom" && (
                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <Field label="Every">
                        <TextInput
                          inputMode="numeric"
                          value={priceCustomCount}
                          onChange={(e) => setPriceCustomCount(e.target.value.replace(/[^\d]/g, ""))}
                        />
                      </Field>
                    </div>
                    <div className="flex-1">
                      <Field label="Unit">
                        <select
                          value={priceCustomUnit}
                          onChange={(e) => setPriceCustomUnit(e.target.value as any)}
                          className="w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-yellow focus:outline-none"
                        >
                          <option value="day">Day(s)</option>
                          <option value="week">Week(s)</option>
                          <option value="month">Month(s)</option>
                          <option value="year">Year(s)</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addPriceMutation.mutate()}
                    disabled={addPriceMutation.isPending || !priceAmount}
                  >
                    {addPriceMutation.isPending ? "Adding..." : "Add"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAddingPrice(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* List of Prices */}
            <div className="space-y-2.5">
              {plan.prices?.map((pr: Price) => {
                const isEditing = editingPriceId === pr.id;
                return (
                  <div key={pr.id} className="flex flex-col p-3 rounded-[10px] border border-line bg-surface-2 gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[13.5px] font-extrabold tracking-[-0.02em] tnum">
                          {formatNaira(pr.unit_amount)}
                        </div>
                        <div className="text-[11px] text-ink-3 capitalize">
                          {priceLabel(pr)}
                        </div>
                      </div>
                      <Badge tone={pr.is_active ? "green" : "gray"}>
                        {pr.is_active ? "Active" : "Archived"}
                      </Badge>
                    </div>

                    {pr.is_active && !isEditing && (
                      <div className="flex items-center gap-3 mt-1.5 border-t border-line-2 pt-2">
                        <button
                          onClick={() => {
                            setEditingPriceId(pr.id);
                            setEditPriceAmount(String(koboToNaira(pr.unit_amount)));
                          }}
                          className="text-[11px] font-bold text-yellow-deep hover:underline"
                        >
                          Change price
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDialog({
                              open: true,
                              title: "Archive Price",
                              description: "Are you sure you want to archive this price? Active subscriptions will not be affected, but no new subscriptions can be created with this price.",
                              onConfirm: () => {
                                archivePriceMutation.mutate(pr.id);
                                setConfirmDialog(null);
                              },
                            });
                          }}
                          disabled={archivePriceMutation.isPending}
                          className="text-[11px] font-bold text-red hover:underline ml-auto cursor-pointer"
                        >
                          Archive
                        </button>
                      </div>
                    )}

                    {isEditing && (
                      <div className="mt-2 space-y-2 border-t border-line-2 pt-2">
                        <Field label="New Amount (NGN)">
                          <div className="flex items-center rounded-[8px] border border-line bg-surface px-2.5">
                            <span className="text-[13px] font-semibold text-ink-3">₦</span>
                            <input
                              inputMode="numeric"
                              value={editPriceAmount}
                              onChange={(e) => setEditPriceAmount(e.target.value.replace(/[^\d]/g, ""))}
                              className="w-full bg-transparent px-1.5 py-1.5 text-[12px] tnum text-ink focus:outline-none"
                            />
                          </div>
                        </Field>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => changePriceMutation.mutate(pr.id)}
                            disabled={changePriceMutation.isPending || !editPriceAmount}
                          >
                            {changePriceMutation.isPending ? "Updating..." : "Update Amount"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingPriceId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {(!plan.prices || plan.prices.length === 0) && (
                <div className="text-[12px] text-ink-4 text-center py-2">No prices configured for this plan.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Danger Zone / Footer */}
      <div className="border-t border-line-2 pt-6 mt-6 space-y-3.5 bg-surface">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-red">Danger Zone</h3>
        <div className="flex flex-col gap-2 bg-red-bg/25 border border-red/10 p-4 rounded-[12px]">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="text-[13px] font-bold text-ink">Cancel Active Subscriptions</div>
              <p className="text-[11.5px] text-ink-3 mt-0.5">Immediately schedule cancellation for all active subscribers under this plan.</p>
            </div>
            {confirmCancel ? (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelSubsMutation.mutate()}
                  disabled={cancelSubsMutation.isPending}
                >
                  Confirm
                </Button>
                <Button variant="default" size="sm" onClick={() => setConfirmCancel(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" className="shrink-0" onClick={() => setConfirmCancel(true)}>
                Cancel All
              </Button>
            )}
          </div>

          <div className="border-t border-line-2/50 my-2 pt-2 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-bold text-ink">Deprecate Plan</div>
              <p className="text-[11.5px] text-ink-3 mt-0.5">Archive the plan. No new checkouts or signups can use it.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="shrink-0"
              onClick={() => {
                setConfirmDialog({
                  open: true,
                  title: "Deprecate Plan",
                  description: "Are you sure you want to deprecate/delete this plan? This action cannot be undone.",
                  onConfirm: () => {
                    deprecateMutation.mutate();
                    setConfirmDialog(null);
                  },
                });
              }}
              disabled={deprecateMutation.isPending}
            >
              {deprecateMutation.isPending ? "Deprecating..." : "Deprecate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
