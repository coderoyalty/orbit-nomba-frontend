import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portalApi, formatNaira, priceLabel, type BackendSubscription, type Plan } from "../lib/api";
import { HostedShell } from "../components/HostedShell";
import { Button, Card, Badge, Field, TextInput } from "../components/ui";
import { useToast } from "../components/Toast";
import { ApiError } from "../lib/http";

export const Route = createFileRoute("/portal/$token")({
  component: PortalPage,
});

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PortalPage() {
  const { token } = Route.useParams();
  const qc = useQueryClient();
  const toast = useToast();

  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  // Card Form State
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardError, setCardError] = useState("");

  // Load portal session details
  const { data: sub, isLoading, error } = useQuery({
    queryKey: ["portal-session", token],
    queryFn: () => portalApi.getSession(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Load available plans for switching
  const { data: plans } = useQuery({
    queryKey: ["portal-plans", token],
    queryFn: () => portalApi.getPlans(token),
    enabled: !!token && showChangePlan,
  });

  // Mutations
  const cancelSub = useMutation({
    mutationFn: () => portalApi.cancelSubscription(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-session", token] });
      toast("Subscription canceled successfully.", "success");
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to cancel subscription", "error");
    },
  });

  const updateCard = useMutation({
    mutationFn: (body: { last4: string; brand: string }) =>
      portalApi.updatePaymentMethod(token, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-session", token] });
      toast("Payment card updated successfully.", "success");
      setShowUpdateCard(false);
      setCardholder("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to update card details", "error");
    },
  });

  const switchPlan = useMutation({
    mutationFn: (planId: string) => portalApi.changePlan(token, { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-session", token] });
      toast("Subscription plan updated successfully.", "success");
      setShowChangePlan(false);
    },
    onError: (err: any) => {
      toast(err?.message || "Failed to change subscription plan", "error");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-2 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-yellow border-t-transparent mx-auto" />
          <p className="text-[13px] font-semibold text-ink-3">Loading billing portal details...</p>
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="min-h-screen bg-surface-2 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-bg border border-red-line flex items-center justify-center text-[20px] mx-auto">
            ⚠️
          </div>
          <h2 className="text-[17px] font-bold text-ink tracking-tight">Portal Session Expired</h2>
          <p className="text-[12.5px] text-ink-3 leading-relaxed">
            This customer portal link is invalid or has expired. Please contact the service provider to request a new secure link.
          </p>
        </Card>
      </div>
    );
  }

  const price = sub.price;
  const plan = price?.plan;
  const isCanceled = sub.status === "canceled";
  const brand = sub.customer?.name || "Customer";
  const initials = sub.customer?.name ? sub.customer.name.substring(0, 2).toUpperCase() : "CS";

  const handleUpdateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 12 || isNaN(Number(cleanNum))) {
      setCardError("Please enter a valid card number.");
      return;
    }
    const last4 = cleanNum.slice(-4);
    let detectedBrand = "Verve";
    if (cleanNum.startsWith("4")) detectedBrand = "VISA";
    else if (cleanNum.startsWith("5")) detectedBrand = "MasterCard";

    updateCard.mutate({ last4, brand: detectedBrand });
  };

  return (
    <HostedShell
      brand={`${sub.project?.name || "Service"} Billing`}
      initials={initials}
      status={{
        label: isCanceled ? "Canceled" : sub.status === "active" ? "Active" : sub.status,
        tone: isCanceled ? "gray" : sub.status === "active" ? "green" : "amber",
      }}
    >
      <h1 className="text-[20px] font-extrabold tracking-[-0.03em] text-ink">
        Manage Subscription
      </h1>
      <p className="text-[12.5px] text-ink-3 mt-0.5">
        View invoice details, update card billing info, or change plan pricing below.
      </p>

      {/* Plan Card */}
      <div className="mt-5 rounded-[14px] border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11.5px] text-ink-4 font-semibold uppercase tracking-wider">Current Plan</div>
            <div className="mt-1 text-[19px] font-extrabold tracking-tight text-ink">
              {plan?.name || "—"}
            </div>
            <div className="text-[12.5px] text-ink-3 mt-0.5">{plan?.description}</div>
          </div>
          {!isCanceled && (
            <Button size="sm" variant="outline" onClick={() => setShowChangePlan(true)}>
              Change
            </Button>
          )}
        </div>

        <div className="h-px bg-line-2" />

        <div className="flex items-center justify-between text-[12.5px]">
          <div>
            <div className="text-[11.5px] text-ink-4">Next Billing Date</div>
            <div className="mt-1 font-bold text-ink">
              {isCanceled ? "Ends at period end" : formatDate(sub.current_period_end)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11.5px] text-ink-4">Amount</div>
            <div className="mt-1 font-extrabold text-ink tnum">
              {price ? `${formatNaira(price.unit_amount)} / ${priceLabel(price)}` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Card Details */}
      <div className="mt-4 flex items-center justify-between rounded-[14px] border border-line bg-surface px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-11 place-items-center rounded-[6px] bg-surface-3 text-[10px] font-extrabold text-ink-2 border border-line-2">
            {sub.paymentMethod?.brand || "CARD"}
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-ink">
              {sub.paymentMethod ? `•••• ${sub.paymentMethod.last4}` : "No card attached"}
            </div>
            <div className="text-[11.5px] text-ink-4">
              {sub.paymentMethod ? `Expires ${sub.paymentMethod.createdAt ? formatDate(sub.paymentMethod.createdAt).substring(3) : "—"}` : "Add details to enable renewals"}
            </div>
          </div>
        </div>
        {!isCanceled && (
          <Button size="sm" variant="ghost" onClick={() => setShowUpdateCard(true)}>
            {sub.paymentMethod ? "Update" : "Add Card"}
          </Button>
        )}
      </div>

      {/* Invoice History */}
      <div className="mt-6 space-y-3">
        <div className="text-[12.5px] font-bold text-ink-2 uppercase tracking-wide">
          Invoice History
        </div>
        
        {sub.invoices && sub.invoices.length > 0 ? (
          <div className="rounded-[14px] border border-line bg-surface overflow-hidden divide-y divide-line-2">
            {sub.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-2 transition-colors">
                <div>
                  <div className="text-[12.5px] font-bold text-ink-2">{formatDate(inv.createdAt)}</div>
                  <div className="text-[11px] font-mono text-ink-4 uppercase mt-0.5">{inv.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={inv.status === "paid" ? "green" : "red"}>
                    {inv.status}
                  </Badge>
                  <span className="text-[13px] font-bold text-ink tnum">
                    {formatNaira(inv.unit_amount ?? price?.unit_amount ?? 0)}
                  </span>
                  <button
                    onClick={() => setActiveReceipt(inv)}
                    className="p-1.5 hover:bg-surface-3 rounded-[6px] text-yellow-deep transition-colors"
                    aria-label="Download receipt"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-line rounded-[14px] text-[12.5px] text-ink-4">
            No payments billed yet.
          </div>
        )}
      </div>

      {/* Cancellation Footer */}
      {!isCanceled && (
        <Button
          variant="danger"
          block
          className="mt-6"
          onClick={() => {
            if (confirm("Are you sure you want to cancel your subscription? This cannot be undone.")) {
              cancelSub.mutate();
            }
          }}
          disabled={cancelSub.isPending}
        >
          {cancelSub.isPending ? "Canceling..." : "Cancel Subscription"}
        </Button>
      )}

      {/* CHANGE PLAN MODAL */}
      {showChangePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setShowChangePlan(false)} />
          <Card className="relative max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-[15.5px] font-bold text-ink">Change Pricing Plan</h2>
              <button className="text-ink-4 hover:text-ink text-[16px] font-bold" onClick={() => setShowChangePlan(false)}>✕</button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {plans?.map((p) => {
                const isCurrent = p.id === plan?.id;
                const actPrice = p.prices?.find((pr) => pr.is_active) ?? p.prices?.[0];
                return (
                  <div
                    key={p.id}
                    onClick={() => !isCurrent && switchPlan.mutate(p.id)}
                    className={`p-3.5 rounded-[10px] border cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? "border-yellow bg-cream"
                        : "border-line bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <div>
                      <div className="text-[13px] font-bold text-ink">{p.name}</div>
                      <div className="text-[11.5px] text-ink-3 mt-0.5">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-extrabold text-ink tnum">
                        {actPrice ? formatNaira(actPrice.unit_amount) : "—"}
                      </div>
                      <div className="text-[10px] text-ink-4">
                        {actPrice ? `per ${priceLabel(actPrice)}` : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* UPDATE CARD MODAL */}
      {showUpdateCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setShowUpdateCard(false)} />
          <Card className="relative max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h2 className="text-[15.5px] font-bold text-ink">Update Payment Method</h2>
              <button className="text-ink-4 hover:text-ink text-[16px] font-bold" onClick={() => setShowUpdateCard(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateCardSubmit} className="space-y-4">
              <Field label="Cardholder Name">
                <TextInput
                  placeholder="e.g. John Doe"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  required
                />
              </Field>
              <Field label="Card Number" error={cardError}>
                <TextInput
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardError("");
                    setCardNumber(e.target.value.replace(/[^\d\s]/g, ""));
                  }}
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry (MM/YY)">
                  <TextInput
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </Field>
                <Field label="CVV">
                  <TextInput
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, ""))}
                    maxLength={4}
                    required
                  />
                </Field>
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button type="submit" variant="primary" block disabled={updateCard.isPending}>
                  {updateCard.isPending ? "Updating Card..." : "Save Card"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowUpdateCard(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* INVOICE RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setActiveReceipt(null)} />
          <Card className="relative max-w-sm w-full p-6 space-y-6 shadow-2xl animate-scale-up select-none print:shadow-none print:border-0">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-green-bg border border-green-line text-[18px] flex items-center justify-center mx-auto mb-2 text-green">
                ✓
              </div>
              <h2 className="text-[16px] font-extrabold text-ink tracking-tight">Payment Receipt</h2>
              <p className="text-[11.5px] text-ink-3">Billed by {sub.project?.name || "Service Provider"}</p>
            </div>
            
            <div className="space-y-2 border-t border-b border-dashed border-line py-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-4">Invoice Reference:</span>
                <span className="font-mono text-ink font-bold">{activeReceipt.id}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-4">Payment Date:</span>
                <span className="text-ink font-bold">{formatDate(activeReceipt.createdAt)}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-4">Subscription Plan:</span>
                <span className="text-ink font-bold">{plan?.name}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-4">Payment Card:</span>
                <span className="text-ink font-bold">{sub.paymentMethod ? `${sub.paymentMethod.brand} •••• ${sub.paymentMethod.last4}` : "Card"}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[15px] font-extrabold">
              <span className="text-ink">Total Billed:</span>
              <span className="text-ink tnum">{formatNaira(activeReceipt.unit_amount ?? price?.unit_amount ?? 0)}</span>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button variant="primary" block onClick={() => window.print()}>
                Print Invoice
              </Button>
              <Button variant="ghost" onClick={() => setActiveReceipt(null)}>
                Dismiss
              </Button>
            </div>
          </Card>
        </div>
      )}
    </HostedShell>
  );
}
