import React from "react";

export function Toast({ children, ...props }) {
  return (
    <div
      className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-md border bg-card p-3 text-card-foreground shadow-lg"
      {...props}
    >
      {children}
    </div>
  );
}

export function ToastTitle({ children }) {
  return <div className="font-semibold">{children}</div>;
}

export function ToastDescription({ children }) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}

export function ToastClose({ onClick }) {
  return (
    <button onClick={onClick} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
      Close
    </button>
  );
}

export function ToastProvider({ children }) {
  return <>{children}</>;
}

export function ToastViewport({ children }) {
  return <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">{children}</div>;
}
