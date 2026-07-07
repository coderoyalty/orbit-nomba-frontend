import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/ui";
import { StateMachine } from "../features/billing/StateMachine";

export const Route = createFileRoute("/app/$projectId/billing")({
  component: BillingPage,
});

function BillingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Billing engine"
        subtitle="Core billing engine access states and recovery configurations."
      />
      <div>
        <StateMachine />
      </div>
    </div>
  );
}
