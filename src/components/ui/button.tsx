import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30 active:shadow-md",
        outline:
          "border border-input bg-background/50 backdrop-blur-sm shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:shadow-md transition-all",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 active:shadow-md",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground dark:hover:bg-accent/50 backdrop-blur-sm transition-all",
        link: "text-primary underline-offset-4 hover:underline transition-all",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4 text-base",
        sm: "h-9 rounded-xl gap-1.5 px-4 has-[>svg]:px-3 text-sm",
        lg: "h-14 rounded-3xl px-8 has-[>svg]:px-6 text-lg",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
    
    const MotionComp = motion(Comp as any)

  return (
      <MotionComp
        ref={ref}
      data-slot="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.5
        }}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
)
Button.displayName = "Button"

export { Button, buttonVariants }
