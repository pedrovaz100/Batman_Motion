interface BatIconProps {
  className?: string;
  title?: string;
}

export default function BatIcon({ className, title = 'Gotham City' }: BatIconProps) {
  return (
    <svg viewBox="0 0 512 170" className={className} fill="currentColor" role="img" aria-label={title}>
      <path d="M256,58 C232,20 184,2 126,12 C154,30 172,48 188,58 L0,40 L0,54 L172,76 C158,104 130,124 92,134 C138,146 186,132 214,104 C232,128 234,148 256,168 C278,148 280,128 298,104 C326,132 374,146 420,134 C382,124 354,104 340,76 L512,54 L512,40 L324,58 C340,48 358,30 386,12 C328,2 280,20 256,58 Z" />
    </svg>
  );
}
