"use client";

import { FC, useState, useCallback, memo } from "react";

import { Logo } from "./Logo";
import { Language } from "./Language";
import { Discord } from "./Discord";
import { MobileMenu } from "./MobileMenu";

export const Header: FC = memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className="w-full py-3 px-4 md:px-20 flex justify-between items-center"
        role="banner"
      >
        <Logo />

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-4"
          role="navigation"
          aria-label="Main navigation"
        >
          <Discord />
          <Language />
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
});
