import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, ...toast }]);
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
