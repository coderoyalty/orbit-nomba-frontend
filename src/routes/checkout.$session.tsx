import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HostedShell } from "../components/HostedShell";
import { Button } from "../components/ui";
import { formatNaira } from "../lib/api";

export const Route = createFileRoute("/checkout/$session")({
  component: CheckoutPage,
});

// In production the $session token resolves to { tenant, plan, prorated }
// from GET /v1/checkout_sessions/:id. Mocked here.
function CheckoutPage() {
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const tenant = { brand: "Paya", initials: "PA" };
  const plan = { name: "Paya Pro", monthly: 1500000, dueToday: 1286000 };

  function subscribe() {
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setDone(true);
    }, 900);
  }

  return (
    <HostedShell brand={tenant.brand} initials={tenant.initials}>
      {done ? (
        <div className="py-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" className="h-6 w-6">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-4 text-[20px] font-extrabold tracking-[-0.02em]">
            You're subscribed
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            Your card was tokenised and {formatNaira(plan.dueToday)} was charged.
            We've emailed a magic link to manage your subscription anytime.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[12px] text-ink-3">You're subscribing to</p>
          <h1 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.03em]">
            {plan.name}
          </h1>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[34px] font-extrabold tracking-[-0.04em] tnum">
              {formatNaira(plan.monthly)}
            </span>
            <span className="text-[14px] text-ink-3">/ month</span>
          </div>

          <div className="mt-4 rounded-[12px] border border-cream-2 bg-cream px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-yellow-ink">
                Due today (prorated)
              </span>
              <span className="text-[13px] font-bold tnum">
                {formatNaira(plan.dueToday)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-yellow-ink">
                Then monthly
              </span>
              <span className="text-[13px] font-bold tnum">
                {formatNaira(plan.monthly)}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 text-[12px] font-semibold text-ink-2">
              Card information
            </div>
            <input
              placeholder="Card number"
              className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] placeholder:text-ink-4 focus:border-yellow focus:outline-none"
            />
            <div className="mt-2 flex gap-2.5">
              <input
                placeholder="MM / YY"
                className="w-1/2 rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] placeholder:text-ink-4 focus:border-yellow focus:outline-none"
              />
              <input
                placeholder="CVV / CVC"
                className="w-1/2 rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] placeholder:text-ink-4 focus:border-yellow focus:outline-none"
              />
            </div>
          </div>

          <Button variant="primary" block className="mt-5" disabled={pending} onClick={subscribe}>
            {pending ? "Processing…" : `Subscribe · ${formatNaira(plan.dueToday)}`}
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-4">
            Card tokenised by Nomba. Recurring billing — cancel anytime from your
            portal.
          </p>
        </>
      )}
    </HostedShell>
  );
}
