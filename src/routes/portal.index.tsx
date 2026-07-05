import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HostedShell } from "../components/HostedShell";
import { Button } from "../components/ui";

export const Route = createFileRoute("/portal/")({
  component: PortalGate,
});

// End-users don't have passwords. They prove identity by clicking a signed
// link mailed to them. POST /v1/portal/magic-link in production.
function PortalGate() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <HostedShell brand="Paya" initials="PA">
      {sent ? (
        <div className="py-4 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-yellow-deep)" strokeWidth="2" className="h-6 w-6">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 5L2 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-[20px] font-extrabold tracking-[-0.02em]">
            Check your inbox
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            We sent a secure sign-in link to{" "}
            <strong className="text-ink">{email}</strong>. It expires in 15
            minutes.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-[12px] font-semibold text-yellow-deep hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">
            Manage your subscription
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            Enter the email you subscribed with and we'll send a secure link — no
            password needed.
          </p>
          <div className="mt-5">
            <div className="mb-1.5 text-[12px] font-semibold text-ink-2">Email</div>
            <input
              type="email"
              placeholder="Enter subscriber email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && setSent(true)}
              className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] placeholder:text-ink-4 focus:border-yellow focus:outline-none"
            />
          </div>
          <Button
            variant="dark"
            block
            className="mt-4"
            disabled={!email}
            onClick={() => setSent(true)}
          >
            Send magic link
          </Button>
        </>
      )}
    </HostedShell>
  );
}
