interface LiveBadgeProps {
  className?: string;
}

export function LiveBadge({ className }: LiveBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white bg-red-500/80 backdrop-blur-sm rounded-full border border-red-400/40 ${className || ''}`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      En Vivo
    </span>
  );
}
