import { cn } from '@/lib/utils';

const COLOR = {
  amarelo: { label: 'Amarelo', className: 'bg-warning' },
  vermelho: { label: 'Vermelho', className: 'bg-error' },
} as const;

/** O cartão em si: retângulo colorido, como o do árbitro. */
export function CardGlyph({
  color,
  size = 'md',
}: {
  color: 'amarelo' | 'vermelho';
  size?: 'md' | 'lg';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0 rounded-[3px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]',
        size === 'lg' ? 'h-7 w-5' : 'h-5 w-3.5',
        COLOR[color].className
      )}
    />
  );
}

