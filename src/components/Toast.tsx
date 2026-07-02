import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";

type ToastType = "error" | "success" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastCtx {
    toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: number) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    const toast = useCallback(
        (message: string, type: ToastType = "error") => {
            const id = nextId++;
            setToasts((t) => [...t, { id, message, type }]);
            setTimeout(() => remove(id), 4500);
        },
        [remove],
    );

    return (
        <Ctx.Provider value={{ toast }}>
            {children}
            <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[320px] flex-col gap-2.5">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => remove(t.id)}
                        className={`pointer-events-auto flex cursor-pointer items-start gap-2.5 rounded-[12px] border px-4 py-3 shadow-[0_8px_24px_rgba(17,17,17,.12)] ${t.type === "error"
                                ? "border-red-bg bg-red-bg text-red"
                                : t.type === "success"
                                    ? "border-green-bg bg-green-bg text-green"
                                    : "border-line bg-surface text-ink"
                            }`}
                        role="alert"
                    >
                        <span className="mt-0.5 flex-shrink-0">
                            {t.type === "error" ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                </svg>
                            ) : t.type === "success" ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                                </svg>
                            )}
                        </span>
                        <span className="text-[12.5px] font-medium leading-relaxed">
                            {t.message}
                        </span>
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    );
}

export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx.toast;
}