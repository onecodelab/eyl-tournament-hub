import eylLogo from "@/assets/eyl-logo.png";

interface EYLLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export function EYLLogo({ size = 50, className = '', withGlow = false }: EYLLogoProps) {
  return (
    <img
      src={eylLogo}
      alt="EYL"
      style={{ height: `${size}px`, width: 'auto' }}
      className={`object-contain ${withGlow ? 'drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]' : ''} ${className}`}
    />
  );
}
