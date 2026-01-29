import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none uppercase tracking-wider cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-2 border-border hover:bg-primary/90 shadow-[3px_3px_0_var(--border)] hover:shadow-[4px_4px_0_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_var(--border)] active:translate-x-[2px] active:translate-y-[2px]',
        destructive:
          'bg-primary text-primary-foreground border-2 border-border hover:bg-primary/90 shadow-[3px_3px_0_var(--border)] hover:shadow-[4px_4px_0_var(--border)]',
        outline:
          'bg-background text-foreground border-2 border-border shadow-[3px_3px_0_var(--border)] hover:bg-secondary active:shadow-[1px_1px_0_var(--border)] active:translate-x-[2px] active:translate-y-[2px]',
        secondary:
          'bg-secondary text-secondary-foreground border-2 border-border shadow-[3px_3px_0_var(--border)] hover:bg-secondary/80',
        ghost:
          'bg-background border-2 border-border hover:bg-secondary shadow-[2px_2px_0_var(--border)] active:shadow-[1px_1px_0_var(--border)] active:translate-x-[1px] active:translate-y-[1px]',
        link: 'text-foreground underline-offset-4 hover:underline border-0 shadow-none',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 gap-1.5 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
