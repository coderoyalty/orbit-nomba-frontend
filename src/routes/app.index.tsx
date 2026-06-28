import { createFileRoute } from "@tanstack/react-router";
import { Card } from "../components/ui";

export const Route = createFileRoute("/app/")({
  component: Overview,
});

function Metric({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up?: boolean;
}) {
  return (
    <Card className="p-[18px]">
      <div className="text-[12px] font-medium text-ink-3">{label}</div>
      <div className="mt-2.5 text-[28px] font-extrabold tracking-[-0.04em] tnum">
        {value}
      </div>
      <div
        className={`mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold ${
          up ? "text-green" : "text-red"
        }`}
      >
        {up ? "▲" : "▼"} {delta}
      </div>
    </Card>
  );
}

function Overview() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">
        Overview
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-3">
        Recurring revenue and recovery at a glance.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="MRR" value="₦2.76M" delta="12.4%" up />
        <Metric label="Active subscribers" value="196" delta="8 this week" up />
        <Metric label="In dunning" value="23" delta="4 recovered" up />
        <Metric label="Churn (30d)" value="2.1%" delta="0.3%" />
      </div>

      <Card className="mt-6 p-6">
        <div className="text-[13px] font-semibold">Monthly recurring revenue</div>
        <div className="mt-5 flex h-[120px] items-end gap-1.5">
          {[40, 52, 48, 61, 58, 70, 66, 78, 74, 88, 92, 100].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-[4px] ${
                i >= 10 ? "bg-yellow" : "bg-cream"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
