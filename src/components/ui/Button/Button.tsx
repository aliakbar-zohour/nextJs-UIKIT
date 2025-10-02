// src/components/ui/Button/Button.tsx
import React from "react";
import classNames from "classnames";

type ButtonProps = {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "icon" | "custom";
  type?: "button" | "submit" | "reset";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "default" | "circle" | "square";
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  type = "button",
  size = "md",
  shape = "default",
  className,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  ...rest
}) => {
  const baseStyles =
    "relative flex items-center justify-center cursor-pointer font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-300 shadow-sm",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300 border border-gray-200",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300 bg-white",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 shadow-sm",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    icon:
      "text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    custom: "",
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const shapes = {
    default: "rounded-lg",
    circle: "rounded-full",
    square: "rounded-none",
  };

  const getIconSize = () => {
    switch (size) {
      case "xs": return "w-3 h-3";
      case "sm": return "w-4 h-4";
      case "md": return "w-5 h-5";
      case "lg": return "w-6 h-6";
      case "xl": return "w-7 h-7";
      default: return "w-5 h-5";
    }
  };

  const getIconSpacing = () => {
    return children && icon ? (iconPosition === "left" ? "ml-2" : "mr-2") : "";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        baseStyles,
        variants[variant],
        sizes[size],
        shapes[shape],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className={classNames("border-2 border-current border-t-transparent rounded-full animate-spin opacity-70", getIconSize())} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className={classNames(getIconSize(), getIconSpacing())}>
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className={classNames(getIconSize(), getIconSpacing())}>
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
