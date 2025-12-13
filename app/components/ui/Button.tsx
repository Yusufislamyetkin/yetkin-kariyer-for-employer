import Link from "next/link";
import { ButtonHTMLAttributes, MouseEvent, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient" | "neon";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      href,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg",
      secondary:
        "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
      outline:
        "border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300",
      ghost:
        "hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 shadow-md hover:shadow-lg",
      gradient:
        "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl",
      neon:
        "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl border-2 border-transparent",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      icon: "h-10 w-10 p-0",
    };

    const disabledState = disabled || isLoading;
    const composedClassName = clsx(
      baseStyles,
      variants[variant],
      sizes[size],
      disabledState && "pointer-events-none opacity-50",
      className
    );

    const content = isLoading ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Yükleniyor...
      </>
    ) : (
      children
    );

    if (href) {
      const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (disabledState) {
          event.preventDefault();
          event.stopPropagation();
        }
        props.onClick?.(event as unknown as MouseEvent<HTMLButtonElement>);
      };

      return (
        <Link
          href={href}
          className={composedClassName}
          aria-disabled={disabledState}
          onClick={handleClick}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={composedClassName}
        disabled={disabledState}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
