import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // success / warning / destructive / info mostram um "cartão do árbitro"
  // colorido antes do texto; o texto fica sempre na cor de tinta (contraste).
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-card text-muted-foreground',
        success:
          'border-border bg-card text-foreground before:ref-card before:bg-success',
        warning:
          'border-border bg-card text-foreground before:ref-card before:bg-warning',
        destructive:
          'border-border bg-card text-foreground before:ref-card before:bg-error',
        info: 'border-border bg-card text-foreground before:ref-card before:bg-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
