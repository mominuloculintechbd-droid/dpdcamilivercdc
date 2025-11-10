import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  default: "bg-gray-900 text-white hover:bg-gray-800",
  ghost: "hover:bg-gray-100 hover:text-gray-900",
  link: "text-gray-900 underline-offset-4 hover:underline",
}

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
