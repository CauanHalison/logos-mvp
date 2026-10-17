import { useContext } from 'react';
import { ToastContext } from '../contexts/toastContextDef';
import type { ToastContextValue } from '../contexts/toastContextDef';

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
}
