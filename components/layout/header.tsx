"use client";

import Link from "next/link";
import { memo } from "react";
import { Logo } from "../logo";
import { usePathname } from "next/navigation";

const LogoLink = memo(function LogoLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Logo className="h-5 w-auto" />
    </Link>
  );
});

export function NavLinks() {
  const pathname = usePathname();
  const links = [
    { href: "/view", label: "View" },
    { href: "/portfolio", label: "Portfolio" },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname?.startsWith(link.href);

        return (
          <Link
            className={`text-sm transition-colors ${
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const Header = memo(function Header() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur bg-background/80">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <LogoLink />
            <NavLinks />
          </div>

          {/* Right: Actions - all memoized */}
          {/* <div className="flex items-center gap-2">
            <SponsorLinks />
            <GitHubStars />
            <ModeToggle />
            <MobileMenu />
          </div> */}
        </div>
      </div>
    </header>
  );
});
