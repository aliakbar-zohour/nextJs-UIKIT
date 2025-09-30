import React from "react";
import classNames from "classnames";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
}) => {
  const baseStyles =
    "relative flex items-center justify-center rounded-xl font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-400",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-400",
    outline:
      "border border-gray-400 text-gray-800 hover:bg-gray-100 focus:ring-gray-400",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-400",
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
        (disabled || loading) && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
