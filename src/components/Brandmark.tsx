export function Brandmark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-[16px] font-extrabold tracking-[-0.03em] text-ink ${className}`}
    >
      <span className="relative inline-block h-[22px] w-[22px]">
        <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rotate-45 rounded-[2px] bg-ink" />
        <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 -rotate-45 rounded-[2px] bg-ink" />
      </span>
      nomba
    </div>
  );
}
