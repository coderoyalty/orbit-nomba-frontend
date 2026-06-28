import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/ui";
import { Ledger } from "../features/billing/Ledger";

export const Route = createFileRoute("/app/invoices")({
  component: () => (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Invoices" subtitle="Every charge, proration, and refund across your tenant." />
      <div className="mt-6">
        <Ledger showRefund />
      </div>
    </div>
  ),
});
