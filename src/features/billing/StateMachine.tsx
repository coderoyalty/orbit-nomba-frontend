import { Card, Badge } from "../../components/ui";

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-ink-4">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Node({
  name,
  desc,
  tone,
}: {
  name: string;
  desc: string;
  tone: "default" | "active" | "warn" | "dead" | "info";
}) {
  const map = {
    default: "border-line bg-surface text-ink",
    active: "border-yellow bg-cream text-yellow-ink",
    warn: "border-amber bg-amber-bg text-amber",
    dead: "border-red bg-red-bg text-red",
    info: "border-blue bg-blue-bg text-blue",
  } as const;
  return (
    <div className={`min-w-[104px] rounded-[12px] border-[1.5px] px-3.5 py-3 text-center ${map[tone]}`}>
      <div className="text-[13px] font-extrabold tracking-[-0.01em]">{name}</div>
      <div className="mt-0.5 text-[10.5px] text-ink-3">{desc}</div>
    </div>
  );
}

export function StateMachine() {
  return (
    <Card className="p-7">
      <h2 className="text-[17px] font-bold tracking-[-0.02em]">
        Access state machine
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
        Finite states drive every badge and webhook. State never touches money —
        the ledger does.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Node name="incomplete" desc="awaiting first charge" tone="info" />
        {ARROW}
        <Node name="active" desc="access granted" tone="active" />
        {ARROW}
        <Node name="past_due" desc="in dunning" tone="warn" />
        {ARROW}
        <Node name="unpaid" desc="dunning exhausted" tone="dead" />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-2 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 rotate-180">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          past_due → active on recovery
        </span>
        <span className="flex items-center gap-1.5 text-red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          cancelled — user ends it (from any state)
        </span>
      </div>

      <div className="mt-6 rounded-[12px] bg-surface-2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold">Dunning schedule</span>
          <Badge tone="amber">4 attempts · smart retry</Badge>
        </div>
        <div className="flex gap-2">
          {[
            { day: "Day 1", note: "retry", live: true },
            { day: "Day 3", note: "retry + email" },
            { day: "Day 5", note: "retry" },
            { day: "Day 7", note: "→ unpaid", dead: true },
          ].map((s) => (
            <div
              key={s.day}
              className={`flex-1 rounded-[9px] border bg-surface px-1 py-2.5 text-center ${
                s.live ? "border-yellow" : s.dead ? "border-red-bg" : "border-line"
              }`}
            >
              <div
                className={`text-[11px] font-extrabold ${
                  s.live ? "text-yellow-ink" : s.dead ? "text-red" : "text-ink-2"
                }`}
              >
                {s.day}
              </div>
              <div className="mt-0.5 text-[10px] text-ink-4">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
