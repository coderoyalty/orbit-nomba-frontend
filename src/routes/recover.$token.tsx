import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HostedShell } from "../components/HostedShell";
import { Button } from "../components/ui";

export const Route = createFileRoute("/recover/$token")({
  component: RecoverPage,
});

function RecoverPage() {
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const due = "₦15,000";
  const detail = { attempt: "2 of 4", nextRetry: "19 Jul", accessEnds: "23 Jul" };

  function pay() {
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setDone(true);
    }, 900);
  }

  return (
    <HostedShell brand="Paya billing" initials="PA" status={{ label: "Past due", tone: "amber" }}>
      {done ? (
        <div className="py-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" className="h-6 w-6">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-4 text-[20px] font-extrabold tracking-[-0.02em]">
            You're back on track
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            {due} was charged and your subscription is active again. Access is
            restored immediately.
          </p>
        </div>
      ) : (
        <>
          <div className="-mx-6 -mt-6 mb-5 flex items-start gap-3 border-b border-[#F0D9A8] bg-amber-bg px-6 py-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="2" className="mt-0.5 h-[18px] w-[18px] flex-shrink-0">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <div className="text-[12.5px] leading-relaxed text-amber">
              <strong className="block font-bold">Your card was declined</strong>
              Update it to keep Paya Pro active.
            </div>
          </div>

          <div className="rounded-[12px] bg-surface-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-3">Amount due</span>
              <span className="text-[13px] font-semibold tnum">{due}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[12px] text-ink-3">Retry attempt</span>
              <span className="text-[13px] font-semibold">{detail.attempt}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[12px] text-ink-3">Next retry</span>
              <span className="text-[13px] font-semibold">{detail.nextRetry}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[12px] text-ink-3">Access ends</span>
              <span className="text-[13px] font-semibold text-red">{detail.accessEnds}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 text-[12px] font-semibold text-ink-2">New card</div>
            <input
              placeholder="Enter 16-digit card number"
              className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] placeholder:text-ink-4 focus:border-yellow focus:outline-none"
            />
          </div>

          <Button variant="primary" block className="mt-4" disabled={pending} onClick={pay}>
            {pending ? "Processing…" : `Pay ${due} now`}
          </Button>
        </>
      )}
    </HostedShell>
  );
}
