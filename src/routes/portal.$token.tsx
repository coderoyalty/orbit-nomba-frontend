import { createFileRoute } from "@tanstack/react-router";
import { HostedShell } from "../components/HostedShell";
import { Button } from "../components/ui";

export const Route = createFileRoute("/portal/$token")({
  component: PortalPage,
});

// The $token is the magic-link payload → resolves to the subscriber's
// subscription via GET /v1/portal/:token. Mocked here.
function PortalPage() {
  const sub = {
    plan: "Paya Pro",
    renews: "14 Jul 2026",
    amount: "₦15,000",
    card: { brand: "VISA", last4: "4821", expiry: "09/27" },
    invoices: [
      { date: "14 Jun 2026", amount: "₦15,000" },
      { date: "14 May 2026", amount: "₦15,000" },
    ],
  };

  return (
    <HostedShell brand="Paya billing" initials="PA" status={{ label: "Active", tone: "green" }}>
      <h1 className="text-[19px] font-extrabold tracking-[-0.02em]">
        Manage subscription
      </h1>

      <div className="mt-4 rounded-[14px] border border-line p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-ink-3">Current plan</div>
            <div className="mt-0.5 text-[18px] font-extrabold tracking-[-0.02em]">
              {sub.plan}
            </div>
          </div>
          <Button size="sm">Change</Button>
        </div>
        <div className="my-3.5 h-px bg-line-2" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-ink-3">Renews</div>
            <div className="mt-0.5 text-[13px] font-semibold">{sub.renews}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-ink-3">Amount</div>
            <div className="mt-0.5 text-[13px] font-semibold tnum">{sub.amount}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-[14px] border border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="grid h-6 w-9 place-items-center rounded-[5px] bg-surface-3 text-[8px] font-extrabold text-ink-2">
            {sub.card.brand}
          </div>
          <div>
            <div className="text-[13px] font-semibold">•••• {sub.card.last4}</div>
            <div className="text-[11px] text-ink-4">Expires {sub.card.expiry}</div>
          </div>
        </div>
        <Button size="sm" variant="ghost">Update</Button>
      </div>

      <div className="mt-4">
        <div className="mb-2.5 text-[12px] font-semibold text-ink-2">
          Invoice history
        </div>
        <div className="space-y-2.5">
          {sub.invoices.map((inv) => (
            <div key={inv.date} className="flex items-center gap-3 text-[12.5px]">
              <span className="text-ink-2">{inv.date}</span>
              <span className="inline-flex items-center rounded-[7px] bg-green-bg px-2 py-0.5 text-[11px] font-semibold text-green">
                Paid
              </span>
              <span className="font-semibold tnum">{inv.amount}</span>
              <button className="ml-auto text-yellow-deep" aria-label="Download invoice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button variant="danger" block className="mt-5">
        Cancel subscription
      </Button>
    </HostedShell>
  );
}
