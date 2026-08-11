type BrandLogoProps = {
  size?: number;
  className?: string;
  href?: string;
};

export function BrandLogo({
  size = 36,
  className = "",
  href = "/",
}: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/volmiq-mark.png"
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
        aria-hidden
      />
      <span className="hidden select-none text-[15px] font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:inline">
        VOL<span className="bg-gradient-to-r from-[var(--violet,#7c3aed)] to-[var(--pink,#ec4899)] bg-clip-text text-transparent">MIQ</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        className="shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]/35 focus-visible:ring-offset-2"
        aria-label="Volmiq home"
      >
        {content}
      </a>
    );
  }

  return content;
}
