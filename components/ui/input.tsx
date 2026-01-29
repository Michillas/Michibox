import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-2 border-border h-10 w-full min-w-0 bg-background px-3 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus:shadow-[3px_3px_0_var(--border)] focus:translate-x-[-1px] focus:translate-y-[-1px]',
        'hover:shadow-[2px_2px_0_var(--border)]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
