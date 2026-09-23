export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg border border-gold/35 bg-surface-2"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 13.5 12 5l9 8.5"
          stroke="var(--color-gold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M7 19.5 16.5 10"
          stroke="var(--color-gold-soft)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function LogoLockup() {
  return (
    <span className="flex items-center gap-2.5">
      <Logo />
      <span className="leading-tight">
        <span className="block font-display text-base font-extrabold text-foreground">
          عقار درايف
        </span>
        <span className="block text-[10px] tracking-[0.2em] text-muted-foreground">AQAR DRIVE</span>
      </span>
    </span>
  );
}
