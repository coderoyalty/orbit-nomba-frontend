import type { ReactNode } from "react";
import { Brandmark } from "./Brandmark";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1.1px, transparent 1.1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative flex items-center gap-2 text-[16px] font-extrabold tracking-[-0.03em] text-white">
          <span className="relative inline-block h-[22px] w-[22px]">
            <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rotate-45 rounded-[2px] bg-yellow" />
            <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 -rotate-45 rounded-[2px] bg-yellow" />
          </span>
          nomba <span className="text-ink-4 font-medium">subscriptions</span>
        </div>

        <div className="relative">
          <div className="mb-4 inline-block rounded-md bg-yellow px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink">
            Billing infrastructure
          </div>
          <h2 className="max-w-md text-[34px] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Ship recurring billing
            <br />
            without rebuilding it.
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ink-4">
            Plans, proration, dunning, and a hosted portal on top of Nomba's
            tokenised-card primitives. Wire it up once, route your payouts, and
            unlock premium features for your users.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface-2 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brandmark />
          </div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-3">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-[13px] text-ink-3">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}