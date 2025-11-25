import { useState, useEffect } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).slice(2);
    const newToast = { id, ...toast };
    setToasts((current) => [...current, newToast]);

    // Auto-dismiss if duration is specified
    if (toast.duration) {
      setTimeout(() => {
        dismiss(id);
      }, toast.duration);
    }
  };

  const dismiss = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    toast: addToast,
    dismiss,
  };
}
