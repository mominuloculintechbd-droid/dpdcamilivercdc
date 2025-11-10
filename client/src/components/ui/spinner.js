import { cn } from "../../lib/utils"

function Spinner({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
