import { RiVerifiedBadgeFill } from "react-icons/ri";

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export function VerifiedBadge({
  className = "",
  size = 16,
}: VerifiedBadgeProps) {
  return (
    <RiVerifiedBadgeFill
      size={size}
      className={`text-blue-500 drop-shadow-[0_1px_2px_rgba(59,130,246,0.5)] ${className}`}
    />
  );
}
