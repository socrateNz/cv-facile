import { ReactNode } from "react";

interface DialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  children?: ReactNode;
  onClose: () => void;
  buttons?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive";
  }[];
}

export function Dialog({
  isOpen,
  title,
  description,
  children,
  onClose,
  buttons,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        {children && <div className="mt-4">{children}</div>}

        {buttons && buttons.length > 0 && (
          <div className="mt-6 flex justify-end gap-3">
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className={`rounded px-4 py-2 font-medium transition-colors ${
                  btn.variant === "destructive"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
