import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent text-primary-foreground rounded-full shadow-[rgba(255,255,255,0.1)_0px_1px_0px_0px_inset,rgba(255,255,255,0.25)_0px_0px_0px_1px,rgba(0,0,0,0.2)_0px_-1px_0px_0px_inset] hover:opacity-60 transition-opacity",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-[rgba(255,255,255,0.1)_0px_1px_0px_0px_inset,rgba(255,255,255,0.25)_0px_0px_0px_1px,rgba(0,0,0,0.2)_0px_-1px_0px_0px_inset]",
        outline: "border border-white/10 bg-transparent shadow-[0_7px_3px_rgba(0,0,0,0.03)] hover:opacity-60 transition-opacity rounded-[6px]",
        secondary: "bg-transparent border border-white/10 text-white rounded-[6px] shadow-[0_7px_3px_rgba(0,0,0,0.03)] hover:opacity-60 transition-opacity",
        ghost: "hover:opacity-60 transition-opacity text-[#6a6b6c] hover:text-white rounded-full",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-white/80 text-[#18191a] hover:bg-white rounded-full transition-colors font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
