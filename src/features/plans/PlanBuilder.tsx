import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  plansApi,
  formatNaira,
  nairaToKobo,
  choiceToInterval,
  type BillingChoice,
  type CreatePlanInput,
} from "../../lib/api";
import { ApiError } from "../../lib/http";
import { Button, Field, TextInput, Card } from "../../components/ui";

const CHOICES: { value: BillingChoice; label: string; sub: string }[] = [
  { value: "monthly", label: "Monthly", sub: "every month" },
  { value: "annual", label: "Annual", sub: "every year" },
  { value: "bi-annual", label: "Bi-annual", sub: "every 6 months" },
  { value: "custom", label: "Custom", sub: "set your own" },
];

const PREVIEW_SUFFIX: Record<BillingChoice, string> = {
  monthly: "/ month",
  annual: "/ year",
  "bi-annual": "/ 6 months",
  custom: "/ cycle",
};

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
  const [choice, setChoice] = useState<BillingChoice>("monthly");
  const [customDays, setCustomDays] = useState("30");
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
    if (choice === "custom" && Number(customDays) < 1)
      next.customDays = "Custom cycle must be at least 1 day.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const { interval, interval_count } = choiceToInterval(
      choice,
      Number(customDays),
    );

    create.mutate({
      name: name.trim(),
      description: description.trim(),
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
          <TextInput placeholder="Pro" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Description" hint="Shown on the checkout screen.">
          <TextInput
            placeholder="Full access, billed monthly."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Price (NGN)" error={errors.amount}>
          <div className="flex items-center rounded-[10px] border border-line bg-surface px-3.5 focus-within:border-yellow">
            <span className="text-[14px] font-semibold text-ink-3">₦</span>
            <input
              inputMode="numeric"
              placeholder="15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              className="w-full bg-transparent px-2 py-2.5 text-[13px] tnum text-ink placeholder:text-ink-4 focus:outline-none"
            />
          </div>
        </Field>

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
          <Field label="Cycle length (days)" error={errors.customDays}>
            <TextInput
              inputMode="numeric"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
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
                {choice === "custom" && Number(customDays)
                  ? `/ ${customDays} days`
                  : PREVIEW_SUFFIX[choice]}
              </span>
            </div>
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
