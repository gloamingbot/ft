import Image from "next/image";
import { memo } from "react";

interface LogoProps {
  className?: string;
}

export const Logo = memo(function Logo({
  className = "h-5 w-auto",
}: LogoProps) {
  return (
    <Image
      src="/Predict-Logo.svg"
      alt="Predict"
      width={24}
      height={24}
      className={className}
      priority
    />
  );
});

export const HeroLogo = memo(function Logo({
  className = "h-36 w-auto",
}: LogoProps) {
  return (
    <Image
      src="/Predict-Logo.svg"
      alt="Predict"
      width={24}
      height={24}
      className={className}
      priority
    />
  );
});
