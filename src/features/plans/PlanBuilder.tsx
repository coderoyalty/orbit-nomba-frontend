import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  plansApi,
  formatNaira,
  nairaToKobo,
  type CreatePlanInput,
} from "../../lib/api";
import { ApiError } from "../../lib/http";
import { Button, Field, TextInput, Card } from "../../components/ui";

type PlanBillingChoice = "monthly" | "annual" | "weekly" | "custom";

const CHOICES: { value: PlanBillingChoice; label: string; sub: string }[] = [
  { value: "monthly", label: "Monthly", sub: "every month" },
  { value: "annual", label: "Annual", sub: "every year" },
  { value: "weekly", label: "Weekly", sub: "every week" },
  { value: "custom", label: "Custom", sub: "set custom interval" },
];

export function PlanBuilder({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(""); // naira, as typed
  const [choice, setChoice] = useState<PlanBillingChoice>("monthly");
  const [customCount, setCustomCount] = useState("1");
  const [customUnit, setCustomUnit] = useState<"day" | "week" | "month" | "year">("month");
  const [trialDays, setTrialDays] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: (input: CreatePlanInput) => plansApi.create(projectId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans", projectId] });
      onDone();
    },
  });

  const amountNaira = Number(amount) || 0;

  function submit() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Plan name needs at least 2 characters.";
    if (amountNaira <= 0) next.amount = "Amount must be greater than zero.";
    
    if (choice === "custom") {
      const cnt = Number(customCount);
      if (isNaN(cnt) || cnt < 1) {
        next.customCount = "Multiplier must be at least 1.";
      }
    }
    
    if (trialDays !== "") {
      const td = Number(trialDays);
      if (isNaN(td) || td < 1) {
        next.trialDays = "Trial period must be at least 1 day.";
      }
    }
    
    setErrors(next);
    if (Object.keys(next).length) return;

    let interval: "day" | "week" | "month" | "year" = "month";
    let interval_count = 1;

    if (choice === "monthly") {
      interval = "month";
      interval_count = 1;
    } else if (choice === "annual") {
      interval = "year";
      interval_count = 1;
    } else if (choice === "weekly") {
      interval = "week";
      interval_count = 1;
    } else if (choice === "custom") {
      interval = customUnit;
      interval_count = Number(customCount);
    }

    const tDays = trialDays !== "" ? Number(trialDays) : undefined;

    create.mutate({
      name: name.trim(),
      description: description.trim(),
      trial_days: tDays,
      price: {
        interval,
        interval_count,
        unit_amount: nairaToKobo(amountNaira), // backend wants kobo
      },
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <Field label="Plan name" error={errors.name}>
          <TextInput placeholder="Enter plan name (e.g., Premium Tier)" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Description" hint="Shown on the checkout screen.">
          <TextInput
            placeholder="Enter plan description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Price (NGN)" error={errors.amount}>
            <div className="flex items-center rounded-[10px] border border-line bg-surface px-3.5 focus-within:border-yellow">
              <span className="text-[14px] font-semibold text-ink-3">₦</span>
              <input
                inputMode="numeric"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full bg-transparent px-2 py-2.5 text-[13px] tnum text-ink placeholder:text-ink-4 focus:outline-none"
              />
            </div>
          </Field>

          <Field label="Trial period (days)" error={errors.trialDays} hint="Optional. Leave empty for no trial.">
            <TextInput
              inputMode="numeric"
              placeholder="Enter number of trial days"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-[12px] font-semibold text-ink-2">
            Billing interval
          </span>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {CHOICES.map((opt) => {
              const active = choice === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setChoice(opt.value)}
                  className={`rounded-[11px] border px-3 py-2.5 text-left transition-colors ${
                    active ? "border-yellow bg-cream" : "border-line bg-surface hover:bg-surface-2"
                  }`}
                >
                  <div className={`text-[13px] font-bold ${active ? "text-yellow-ink" : "text-ink"}`}>
                    {opt.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-4">{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {choice === "custom" && (
          <div className="flex gap-4">
            <div className="w-1/3">
              <Field label="Every" error={errors.customCount}>
                <TextInput
                  inputMode="numeric"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value.replace(/[^\d]/g, ""))}
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Unit">
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as any)}
                  className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink focus:border-yellow focus:outline-none"
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

        {create.isError && (
          <p className="rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-medium text-red">
            {create.error instanceof ApiError
              ? create.error.message
              : "Could not create the plan. Try again."}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="primary" onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create plan"}
          </Button>
          <Button variant="ghost" onClick={onDone} disabled={create.isPending}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4">
          Checkout preview
        </span>
        <Card className="overflow-hidden">
          <div className="border-b border-line-2 px-5 py-3.5 text-[12px] font-semibold text-ink-3">
            You're subscribing to
          </div>
          <div className="px-5 py-5">
            <div className="text-[18px] font-extrabold tracking-[-0.02em]">
              {name || "Plan name"}
            </div>
            {description && (
              <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{description}</p>
            )}
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[30px] font-extrabold tracking-[-0.04em] tnum">
                {formatNaira(nairaToKobo(amountNaira))}
              </span>
              <span className="text-[13px] text-ink-3">
                {choice === "monthly" && "/ month"}
                {choice === "annual" && "/ year"}
                {choice === "weekly" && "/ week"}
                {choice === "custom" && `/ ${customCount} ${customUnit}${Number(customCount) > 1 ? "s" : ""}`}
              </span>
            </div>
            {Number(trialDays) > 0 && (
              <div className="mt-3.5 flex items-center gap-1.5 rounded-[8px] bg-green-bg px-2.5 py-1.5 text-[11.5px] font-semibold text-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Includes {trialDays}-day free trial
              </div>
            )}
          </div>
        </Card>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-4">
          Proration on plan changes is computed server-side — this card mirrors
          the base price only.
        </p>
      </div>
    </div>
  );
}
