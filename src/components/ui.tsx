import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { useToast } from "./Toast";

type ButtonVariant = "primary" | "dark" | "default" | "outline" | "ghost" | "danger";

const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-[10px] border text-[13px] font-bold transition-all duration-150 ease-in-out cursor-pointer hover:-translate-y-[1.5px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-yellow border-yellow text-ink hover:bg-yellow-deep px-4 py-2.5",
  dark: "bg-ink border-ink text-white hover:bg-ink-2 px-4 py-2.5",
  default:
    "bg-surface border-line text-ink hover:bg-surface-2 px-4 py-2.5",
  outline:
    "bg-surface border-line text-ink hover:bg-surface-2 px-4 py-2.5",
  ghost: "border-transparent bg-transparent text-ink-2 hover:bg-surface-3 px-4 py-2.5",
  danger:
    "bg-red border-red text-white hover:bg-red-deep px-4 py-2.5",
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
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-[14px] border border-line bg-surface ${className}`} {...props}>
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
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    toast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold text-ink-2">{label}</div>
      <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 py-2.5">
        <span className="flex-1 truncate font-mono text-[12px] text-ink-3">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`text-[11px] font-semibold transition-all cursor-pointer hover:-translate-y-[0.5px] active:translate-y-0 ${
            copied ? "text-green font-bold" : "text-yellow-deep hover:underline"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "dark",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "dark" | "danger" | "primary";
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fade-in">
      <Card className="w-full max-w-md p-6 shadow-2xl animate-slide-in">
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        <p className="mt-2.5 text-[13px] leading-relaxed text-ink-3">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={variant === "danger" ? "danger" : variant === "primary" ? "primary" : "dark"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
