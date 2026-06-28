import type { ReactNode } from "react";

// Layer 2 surfaces wear the TENANT's identity, not Nomba's. The engine stays
// invisible. Brand props would come from the checkout-session / portal token.
export function HostedShell({
  brand,
  initials,
  status,
  children,
}: {
  brand: string;
  initials: string;
  status?: { label: string; tone: "green" | "amber" | "gray" };
  children: ReactNode;
}) {
  const toneClass =
    status?.tone === "green"
      ? "bg-green-bg text-green"
      : status?.tone === "amber"
      ? "bg-amber-bg text-amber"
      : "bg-surface-3 text-ink-2";

  return (
    <div className="flex min-h-full items-start justify-center bg-canvas px-4 py-10 sm:py-16">
      <div className="w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-[0_1px_2px_rgba(17,17,17,.04),0_12px_30px_rgba(17,17,17,.07)]">
          <div className="flex items-center justify-between border-b border-line-2 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-violet-bg text-[12px] font-bold text-violet">
                {initials}
              </span>
              <span className="text-[14px] font-bold">{brand}</span>
            </div>
            {status ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {status.label}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-[7px] bg-surface-3 px-2.5 py-1 text-[11px] font-semibold text-ink-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure
              </span>
            )}
          </div>
          <div className="px-6 py-6">{children}</div>
        </div>
        <p className="mt-4 text-center text-[11px] text-ink-4">
          Billing secured by Nomba · cancel anytime from your portal
        </p>
      </div>
    </div>
  );
}
