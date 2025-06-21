import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-accent hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-neutral-900 hover:bg-secondary/80',
        destructive:
          'border-transparent bg-error text-accent hover:bg-error/80',
        outline: 'border-neutral-700 text-accent',
        success:
          'border-transparent bg-success text-accent hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-accent hover:bg-warning/80',
        info: 'border-transparent bg-info text-accent hover:bg-info/80',
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
