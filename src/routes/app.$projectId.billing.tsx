import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/ui";
import { StateMachine } from "../features/billing/StateMachine";
import { Ledger } from "../features/billing/Ledger";

export const Route = createFileRoute("/app/$projectId/billing")({
  component: BillingPage,
});

function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Billing engine"
        subtitle="The two things you're judged on — state machine and ledger, kept apart."
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <StateMachine />
        <Ledger showRefund />
      </div>
    </div>
  );
}
