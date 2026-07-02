import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

export function Button({
  children,
  icon,
  variant = "secondary",
  onClick,
  disabled,
  ariaLabel,
  className
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`button button--${variant}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
