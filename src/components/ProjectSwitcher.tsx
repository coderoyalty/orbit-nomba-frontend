import { useState, useRef, useEffect } from "react";
import { useProjects } from "./ProjectContext";
import { deriveInitials } from "../lib/auth";

export function ProjectSwitcher() {
  const { projects, current, setCurrent } = useProjects();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative mb-1.5" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-[10px] border border-line bg-surface px-2.5 py-2.5 text-left hover:bg-surface-2 cursor-pointer"
      >
        <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-[7px] bg-violet-bg text-[10px] font-extrabold text-violet">
          {current ? deriveInitials(current.name) : "—"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-bold">
            {current?.name ?? "No project"}
          </span>
          <span className="block text-[10px] text-ink-4">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-ink-4)"
          strokeWidth="2"
          className="h-3 w-3 flex-shrink-0"
        >
          <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-[12px] border border-line bg-surface shadow-[0_8px_24px_rgba(17,17,17,.12)]">
          <div className="max-h-56 overflow-auto py-1">
            {projects.map((p) => {
              const active = p.id === current?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrent(p);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-[12px] hover:bg-surface-2 cursor-pointer ${
                    active ? "bg-cream" : ""
                  }`}
                >
                  <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-[6px] bg-violet-bg text-[9px] font-extrabold text-violet">
                    {deriveInitials(p.name)}
                  </span>
                  <span className="flex-1 truncate font-semibold">
                    {p.name}
                  </span>
                  {active && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-yellow-deep)"
                      strokeWidth="2.5"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 border-t border-line-2 px-2.5 py-2.5 text-left text-[12px] font-semibold text-yellow-deep hover:bg-surface-2 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New project
          </button>
        </div>
      )}
    </div>
  );
}
