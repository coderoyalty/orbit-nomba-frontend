import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "default" | "ghost" | "danger";

const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-[10px] border text-[13px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-yellow border-yellow text-ink hover:brightness-[.97] px-4 py-2.5",
  dark: "bg-ink border-ink text-white hover:bg-ink-2 px-4 py-2.5",
  default:
    "bg-surface border-line text-ink hover:bg-surface-2 px-4 py-2.5",
  ghost: "border-transparent bg-transparent text-ink-2 hover:bg-surface-3 px-4 py-2.5",
  danger:
    "border-red-bg bg-transparent text-red hover:bg-red-bg px-4 py-2.5",
};

export function Button({
  variant = "default",
  size = "md",
  block,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  block?: boolean;
}) {
  const sizeClass =
    size === "sm" ? "!px-3 !py-1.5 !text-[12px]" : "";
  return (
    <button
      className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${sizeClass} ${
        block ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type BadgeTone =
  | "yellow"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "gray";

const BADGE_TONE: Record<BadgeTone, string> = {
  yellow: "bg-cream text-yellow-ink",
  green: "bg-green-bg text-green",
  amber: "bg-amber-bg text-amber",
  red: "bg-red-bg text-red",
  blue: "bg-blue-bg text-blue",
  violet: "bg-violet-bg text-violet",
  gray: "bg-surface-3 text-ink-2",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[11px] font-semibold ${BADGE_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-ink-2">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-red">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-ink-4">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-4 focus:border-yellow focus:outline-none ${className}`}
      {...props}
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[14px] border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[13.5px] text-ink-3">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold text-ink-2">{label}</div>
      <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 py-2.5">
        <span className="flex-1 truncate font-mono text-[12px] text-ink-3">
          {value}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(value)}
          className="text-[11px] font-semibold text-yellow-deep hover:underline"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
