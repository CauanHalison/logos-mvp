import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ToastItem, ToastType } from '../types';
import { ToastContext } from './toastContextDef';
import { ToastContainer } from '../components/ToastContainer';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        message,
        type,
        title,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast(message, 'error', title),
    [showToast]
  );
  const success = useCallback(
    (message: string, title?: string) => showToast(message, 'success', title),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', title),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast(message, 'info', title),
    [showToast]
  );

  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type?: ToastType;
        message: string;
        title?: string;
        duration?: number;
      }>;
      if (customEvent.detail?.message) {
        showToast(
          customEvent.detail.message,
          customEvent.detail.type || 'info',
          customEvent.detail.title,
          customEvent.detail.duration
        );
      }
    };

    window.addEventListener('app:toast', handleGlobalToast);
    return () => {
      window.removeEventListener('app:toast', handleGlobalToast);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        error,
        success,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
