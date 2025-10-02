import { useContext } from 'react';
import { ToastProps } from './Toast';
import { useToast } from './ToastProvider';

// Re-export the context and types from ToastProvider
export { useToast, createToastHelpers } from './ToastProvider';

// Additional utility types and functions
export interface ToastOptions extends Partial<Omit<ToastProps, 'message' | 'variant'>> {
  title?: string;
  duration?: number;
  closable?: boolean;
  showIcon?: boolean;
}

export interface ToastHelpers {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  custom: (message: string, variant: ToastProps['variant'], options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// Hook that returns all toast helper functions
export const useToastHelpers = (): ToastHelpers => {
  const { showToast, hideToast, hideAllToasts } = useToast();

  return {
    success: (message: string, options?: ToastOptions) =>
      showToast({ ...options, message, variant: 'success' }),
    
    error: (message: string, options?: ToastOptions) =>
      showToast({ ...options, message, variant: 'error' }),
    
    warning: (message: string, options?: ToastOptions) =>
      showToast({ ...options, message, variant: 'warning' }),
    
    info: (message: string, options?: ToastOptions) =>
      showToast({ ...options, message, variant: 'info' }),
    
    custom: (message: string, variant: ToastProps['variant'] = 'info', options?: ToastOptions) =>
      showToast({ ...options, message, variant }),
    
    dismiss: hideToast,
    dismissAll: hideAllToasts,
  };
};

export default useToastHelpers;
