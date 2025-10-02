'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { ToastProps, ToastVariant, ToastPosition } from './Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

interface ToastItem extends ToastProps {
  id: string;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

let toastIdCounter = 0;

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultPosition = 'top-right',
  defaultDuration = 5000,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toastProps: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastItem = {
      id,
      position: defaultPosition,
      duration: defaultDuration,
      ...toastProps,
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts);
    });

    return id;
  }, [defaultPosition, defaultDuration, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || defaultPosition;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastItem[]>);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render toast containers for each position */}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position} className="fixed z-50 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {positionToasts.map((toast, index) => (
              <div
                key={toast.id}
                className="pointer-events-auto mb-2"
                style={{
                  zIndex: 50 + index,
                }}
              >
                <Toast
                  {...toast}
                  onClose={() => hideToast(toast.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </ToastContext.Provider>
  );
};

// Convenience functions for different toast types
export const createToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: (message: string, options?: Partial<ToastProps>) =>
      showToast({ ...options, message, variant: 'success' }),
    
    error: (message: string, options?: Partial<ToastProps>) =>
      showToast({ ...options, message, variant: 'error' }),
    
    warning: (message: string, options?: Partial<ToastProps>) =>
      showToast({ ...options, message, variant: 'warning' }),
    
    info: (message: string, options?: Partial<ToastProps>) =>
      showToast({ ...options, message, variant: 'info' }),
  };
};

export default ToastProvider;
