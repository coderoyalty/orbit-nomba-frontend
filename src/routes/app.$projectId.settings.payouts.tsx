import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutsApi } from "../lib/api";
import { PageHeader, Card, Field, TextInput, Button, Badge } from "../components/ui";

export const Route = createFileRoute("/app/$projectId/settings/payouts")({
  component: PayoutsPage,
});

// Nigerian banks — in production this is GET /v1/banks.
const BANKS = [
  "Access Bank",
  "Guaranty Trust Bank",
  "Zenith Bank",
  "United Bank for Africa",
  "First Bank of Nigeria",
  "Kuda Microfinance Bank",
  "Opay",
  "Moniepoint MFB",
  "Wema Bank",
  "Sterling Bank",
];

function PayoutsPage() {
  const qc = useQueryClient();
  const { data: existing, isLoading } = useQuery({
    queryKey: ["payouts"],
    queryFn: payoutsApi.get,
  });

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resolve = useMutation({
    mutationFn: () => payoutsApi.resolveAccount(bankName, accountNumber),
    onSuccess: (name) => {
      setResolvedName(name);
      setErrors((e) => ({ ...e, accountNumber: "" }));
    },
    onError: (err: Error) =>
      setErrors((e) => ({ ...e, accountNumber: err.message })),
  });

  const save = useMutation({
    mutationFn: () =>
      payoutsApi.save({ bankName, accountNumber, accountName: resolvedName }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payouts"] }),
  });

  function onAccountChange(v: string) {
    const digits = v.replace(/[^\d]/g, "").slice(0, 10);
    setAccountNumber(digits);
    setResolvedName("");
    // auto-resolve once we have a bank + 10 digits
    if (bankName && digits.length === 10) {
      resolve.mutate();
    }
  }

  function onBankChange(v: string) {
    setBankName(v);
    setResolvedName("");
    if (v && accountNumber.length === 10) resolve.mutate();
  }

  function submit() {
    const next: Record<string, string> = {};
    if (!bankName) next.bankName = "Select your bank.";
    if (accountNumber.length !== 10)
      next.accountNumber = "Enter a valid 10-digit account number.";
    else if (!resolvedName)
      next.accountNumber = "We couldn't verify this account yet.";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  // already onboarded → show the connected state
  if (!isLoading && existing) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Payouts"
          subtitle="Where your subscription revenue settles."
        />
        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold">Settlement account</span>
            <Badge tone="green">Connected</Badge>
          </div>
          <div className="divide-y divide-line-2">
            <Row label="Bank">{existing.bankName}</Row>
            <Row label="Account number">
              <span className="tnum">{existing.accountNumber}</span>
            </Row>
            <Row label="Account name">{existing.accountName}</Row>
            <Row label="Split sub-account">
              <span className="font-mono text-[12px] text-ink-3">
                {existing.subAccount}
              </span>
            </Row>
          </div>
          <div className="mt-5 rounded-[12px] border border-cream-2 bg-cream px-4 py-3.5 text-[12px] leading-relaxed text-yellow-ink">
            Payments are split at settlement: your share routes to this account
            via the generated sub-account, and the platform fee is deducted
            automatically.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Set up payouts"
        subtitle="Add the bank account where your revenue should settle. We generate a split sub-account so each charge routes to you automatically."
      />

      <Card className="mt-6 p-6">
        {isLoading ? (
          <div className="h-56 animate-pulse rounded-[10px] bg-surface-3" />
        ) : (
          <div className="space-y-5">
            <Field label="Bank" error={errors.bankName}>
              <select
                value={bankName}
                onChange={(e) => onBankChange(e.target.value)}
                className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink focus:border-yellow focus:outline-none"
              >
                <option value="">Select your bank</option>
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Account number"
              error={errors.accountNumber}
              hint="10 digits — we'll verify the account name automatically."
            >
              <TextInput
                inputMode="numeric"
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChange={(e) => onAccountChange(e.target.value)}
              />
            </Field>

            {/* resolved-name surface */}
            {resolve.isPending && (
              <div className="flex items-center gap-2 rounded-[10px] bg-surface-2 px-3.5 py-2.5 text-[12px] text-ink-3">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-yellow" />
                Verifying account…
              </div>
            )}
            {resolvedName && !resolve.isPending && (
              <div className="flex items-center gap-2 rounded-[10px] bg-green-bg px-3.5 py-2.5 text-[12.5px] font-semibold text-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {resolvedName}
              </div>
            )}

            {save.isError && (
              <p className="rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-medium text-red">
                Could not save your account. Try again.
              </p>
            )}

            <div className="pt-1">
              <Button
                variant="primary"
                disabled={save.isPending || !resolvedName}
                onClick={submit}
              >
                {save.isPending ? "Saving…" : "Save & generate sub-account"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-4">
        Your account name is verified against the bank before payouts are
        enabled. Nomba generates a dedicated sub-account so platform fees and
        your share are split at the moment of settlement.
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className="text-[13px] font-semibold">{children}</span>
    </div>
  );
}
