import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; title: string; description?: string; type?: ToastType; duration?: number };

type ToastContextValue = {
  addToast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, ...t };
    setToasts((prev) => [...prev, toast]);
    const duration = t.duration ?? 3500;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, duration);
    }
  }, []);

  const remove = useCallback((id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 w-[90vw] max-w-sm" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-lg border shadow bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden`}
          >
            <div className={`px-4 py-3 flex items-start gap-3 ${
              t.type === "success" ? "border-l-4 border-l-green-500" : t.type === "error" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-blue-500"
            }`}>
              <div className="pt-0.5">
                {t.type === 'success' ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">✓</span>
                ) : t.type === 'error' ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700">!</span>
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700">i</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.title}</div>
                {t.description ? (
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{t.description}</div>
                ) : null}
              </div>
              <button className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white" onClick={() => remove(t.id)} aria-label="Close">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
