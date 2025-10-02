'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { FiCheck, FiX, FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

const toastVariants = {
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    text: 'text-gray-800',
    iconColor: 'text-green-600',
    icon: FiCheck,
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    text: 'text-gray-800',
    iconColor: 'text-red-600',
    icon: FiXCircle,
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    text: 'text-gray-800',
    iconColor: 'text-amber-600',
    icon: FiAlertTriangle,
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-gray-800',
    iconColor: 'text-blue-600',
    icon: FiInfo,
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

const animationVariants = {
  'top-right': {
    initial: { x: 300, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: 300, opacity: 0, scale: 0.8 },
  },
  'top-left': {
    initial: { x: -300, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: -300, opacity: 0, scale: 0.8 },
  },
  'bottom-right': {
    initial: { x: 300, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: 300, opacity: 0, scale: 0.8 },
  },
  'bottom-left': {
    initial: { x: -300, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: -300, opacity: 0, scale: 0.8 },
  },
  'top-center': {
    initial: { y: -100, opacity: 0, scale: 0.8 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -100, opacity: 0, scale: 0.8 },
  },
  'bottom-center': {
    initial: { y: 100, opacity: 0, scale: 0.8 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: 100, opacity: 0, scale: 0.8 },
  },
};

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  position = 'top-center',
  showIcon = true,
  closable = true,
  onClose,
  className,
}) => {
  const variantConfig = toastVariants[variant];
  const IconComponent = variantConfig.icon;
  const animations = animationVariants[position];

  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={animations.initial}
      animate={animations.animate}
      exit={animations.exit}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      className={classNames(
        'fixed z-50 max-w-sm w-full shadow-sm border backdrop-blur-sm',
        'p-4 flex items-start gap-3 rounded-lg',
        variantConfig.bg,
        variantConfig.border,
        variantConfig.text,
        positionClasses[position],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className={classNames("w-5 h-5", variantConfig.iconColor)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-1 leading-tight">
            {title}
          </h4>
        )}
        <p className="text-sm leading-relaxed opacity-90">
          {message}
        </p>
      </div>

      {/* Close Button */}
      {closable && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-400 hover:text-gray-600"
          aria-label="Close notification"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}

      {/* Progress Bar */}
      {duration > 0 && (
        <motion.div
          className={classNames(
            "absolute bottom-0 left-0 h-1 rounded-b-lg",
            variant === 'success' && 'bg-green-200',
            variant === 'error' && 'bg-red-200',
            variant === 'warning' && 'bg-amber-200',
            variant === 'info' && 'bg-blue-200'
          )}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

export default Toast;
