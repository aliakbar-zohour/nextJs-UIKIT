// src/components/ui/Button/Button.tsx
import React from "react";
import classNames from "classnames";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  type?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  type,
  size = "md",
  className,
  onClick,
  disabled = false,
  loading = false,
}) => {
  const baseStyles =
    "relative flex items-center justify-center cursor-pointer rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-300 shadow-sm",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300 border border-gray-200",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300 bg-white",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
