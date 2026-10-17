import { createContext } from 'react';
import type { ToastItem, ToastType } from '../types';

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  error: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
