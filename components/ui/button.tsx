import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { LoadingIcon } from "@/components/icons"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium   transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-koru-purple text-white shadow-md hover:bg-koru-purple/90 hover:shadow-lg hover:shadow-koru-purple/25 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border-2 border-koru-purple bg-transparent text-koru-purple hover:bg-koru-purple/10 hover:-translate-y-0.5",
        secondary:
          "bg-white dark:bg-neutral-900 border-2 border-koru-purple text-koru-purple shadow-sm hover:bg-koru-purple/5 hover:-translate-y-0.5",
        ghost: 
          "hover:bg-koru-purple/10 hover:text-koru-purple",
        link: 
          "text-koru-purple underline-offset-4 hover:underline",
        golden:
          "bg-transparent border-2 border-koru-golden text-koru-golden hover:bg-koru-golden/10 hover:-translate-y-0.5 relative overflow-hidden",
        accent:
          "bg-koru-golden text-neutral-900 shadow-md hover:bg-koru-golden/90 hover:shadow-lg hover:shadow-koru-golden/25 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingIcon className="animate-spin h-4 w-4" />
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
