import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ledgerApi, formatNaira, LEDGER_META } from "../../lib/api";
import { Card, Badge, Button } from "../../components/ui";

export function Ledger({ showRefund = false }: { showRefund?: boolean }) {
  const qc = useQueryClient();
  const { data: entries, isLoading } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerApi.list,
  });
  const [refunding, setRefunding] = useState(false);
  const [amount, setAmount] = useState("");

  const refund = useMutation({
    mutationFn: (n: number) => ledgerApi.refund(n),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      setRefunding(false);
      setAmount("");
    },
  });

  return (
    <Card className="p-7">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[17px] font-bold tracking-[-0.02em]">Ledger</h2>
          <p className="mt-1 text-[13px] text-ink-3">
            Immutable money trail — separate from access state.
          </p>
        </div>
        {showRefund && !refunding && (
          <Button variant="default" size="sm" onClick={() => setRefunding(true)}>
            Issue refund
          </Button>
        )}
      </div>

      {refunding && (
        <div className="mt-4 rounded-[12px] border border-line bg-surface-2 p-4">
          <div className="text-[12px] font-semibold text-ink-2">
            Refund amount (NGN)
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-[10px] border border-line bg-surface px-3.5 focus-within:border-yellow">
              <span className="text-[14px] font-semibold text-ink-3">₦</span>
              <input
                inputMode="numeric"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full bg-transparent px-2 py-2.5 text-[13px] tnum focus:outline-none"
              />
            </div>
            <Button
              variant="primary"
              disabled={refund.isPending || !Number(amount)}
              onClick={() => refund.mutate(Number(amount))}
            >
              {refund.isPending ? "Processing…" : "Refund"}
            </Button>
            <Button variant="ghost" onClick={() => setRefunding(false)}>
              Cancel
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-ink-4">
            Appends a new ledger entry — historical records are never rewritten.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 h-32 animate-pulse rounded-[10px] bg-surface-3" />
      ) : (
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              {["Entry", "Type", "Amount"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-3 last:text-right"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries?.map((e) => {
              const meta = LEDGER_META[e.type];
              return (
                <tr key={e.id} className="border-t border-line-2">
                  <td className="px-3 py-3">
                    <div className="font-mono text-[12px] font-semibold">{e.id}</div>
                    <div className="text-[10px] text-ink-4">
                      {e.date}
                      {e.note ? ` · ${e.note}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </td>
                  <td
                    className={`px-3 py-3 text-right tnum text-[13px] font-semibold ${
                      e.amount < 0 ? "text-red" : "text-green"
                    }`}
                  >
                    {e.amount < 0 ? "" : "+"}
                    {formatNaira(e.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="mt-4 rounded-[12px] border border-cream-2 bg-cream px-4 py-3.5">
        <div className="flex gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-yellow-deep)" strokeWidth="2" className="mt-0.5 h-[18px] w-[18px] flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[12px] leading-relaxed text-yellow-ink">
            A failed charge writes a ledger entry but{" "}
            <strong className="text-ink">never rewrites history</strong>. Dunning
            moves the state machine; the ledger only ever appends.
          </p>
        </div>
      </div>
    </Card>
  );
}
