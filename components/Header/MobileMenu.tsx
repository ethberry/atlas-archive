"use client";

import { FC, memo, useCallback } from "react";
import Link from "next/link";

import { EnabledLanguages } from "@/lib/i18n";
import { useAppStore } from "@/components/providers/AppStoreProvider";

import { LANGUAGE_OPTIONS } from "./constants";
import { Logo } from "./Logo";
import { SocialMediaButton } from "../SocialMediaButton";

interface IMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: FC<IMobileMenuProps> = memo(({ isOpen, onClose }) => {
  const { language, setLanguage } = useAppStore((state) => state);

  const handleLanguageChange = useCallback(
    (newLanguage: EnabledLanguages) => {
      setLanguage(newLanguage);
      onClose();
    },
    [setLanguage, onClose],
  );

  if (!isOpen) return null;

  return (
    <>
      <nav
        className="fixed top-0 right-0 h-full w-full bg-[#15112C] z-50 md:hidden animate-slide-in"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-between items-center p-4">
          <Logo />
          <button
            onClick={onClose}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={onClose}
              className="text-white text-[24px] font-sans hover:text-[#4c5fd5] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/saft"
              onClick={onClose}
              className="text-white text-[24px] font-sans hover:text-[#4c5fd5] transition-colors"
            >
              SAFT
            </Link>
            <Link
              href="/terms-and-conditions"
              onClick={onClose}
              className="text-white text-[24px] font-sans hover:text-[#4c5fd5] transition-colors"
            >
              Terms of Use — SAFT Offering
            </Link>
          </div>

          <div className="flex space-x-[8px] tablet:space-x-[16px] mt-10">
            <SocialMediaButton href="https://x.com/coart_market">
              <svg
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.1603 0.0268555H18.1121L11.6634 7.39732L19.2498 17.4269H13.3097L8.65717 11.344L3.33366 17.4269H0.380123L7.27766 9.54332L0 0.0268555H6.09089L10.2963 5.58682L15.1603 0.0268555ZM14.1243 15.6601H15.7599L5.20215 1.70082H3.44698L14.1243 15.6601Z"
                  fill="#6D74B9"
                />
              </svg>
            </SocialMediaButton>
            <SocialMediaButton href="https://t.me/coart_market">
              <svg
                width="20"
                height="17"
                viewBox="0 0 20 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.2747 2.17769L16.4192 15.7731C16.2061 16.7107 15.6095 16.9664 14.7997 16.4976L10.41 13.2586L8.32166 15.3043C8.06595 15.56 7.89547 15.7305 7.42667 15.7305L7.725 11.2555L15.8652 3.92506C16.2487 3.62673 15.7799 3.41364 15.3111 3.75459L5.25311 10.0622L0.948617 8.74098C0.0110045 8.44265 -0.0316143 7.80337 1.11909 7.33456L18.0814 0.813892C18.8485 0.51556 19.5304 0.984367 19.2747 2.17769Z"
                  fill="white"
                />
              </svg>
            </SocialMediaButton>
            <SocialMediaButton href="https://www.facebook.com/coart.space">
              <svg
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.329102 9.78202C0.330179 14.3356 3.64143 18.2128 8.13876 18.9265V12.4571H5.7904V9.78202H8.14153V7.7456C8.03643 6.78066 8.36602 5.81896 9.04093 5.12134C9.71583 4.42372 10.6661 4.06248 11.634 4.13559C12.3287 4.14681 13.0217 4.20869 13.7074 4.32072V6.59688H12.5374C12.1346 6.54412 11.7297 6.67716 11.4366 6.9585C11.1436 7.23984 10.9942 7.63905 11.0305 8.04366V9.78202H13.5954L13.1854 12.4581H11.0305V18.9265C15.8942 18.1578 19.3049 13.7158 18.7915 8.81849C18.2782 3.92119 14.0206 0.283 9.10312 0.539634C4.18567 0.796268 0.329883 4.85788 0.329102 9.78202Z"
                  fill="#6D74B9"
                />
              </svg>
            </SocialMediaButton>
            <SocialMediaButton href="https://www.instagram.com/coartmarket">
              <svg
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.84277 18.7445C7.38277 18.7445 7.09277 18.7315 6.13277 18.6895C5.38415 18.6649 4.64521 18.5127 3.94777 18.2395C2.74108 17.7699 1.78691 16.8154 1.31777 15.6085C1.05508 14.9085 0.913391 14.169 0.898773 13.4215C0.842773 12.4635 0.842773 12.1495 0.842773 9.7085C0.842773 7.2415 0.855773 6.9535 0.898773 5.9985C0.913711 5.25202 1.05539 4.5135 1.31777 3.8145C1.7864 2.60603 2.74212 1.65067 3.95077 1.1825C4.64942 0.918698 5.38812 0.77664 6.13477 0.762496C7.08977 0.708496 7.40377 0.708496 9.84277 0.708496C12.3228 0.708496 12.6078 0.721496 13.5528 0.762496C14.3014 0.776763 15.042 0.918806 15.7428 1.1825C16.9511 1.6512 17.9066 2.60637 18.3758 3.8145C18.6429 4.52369 18.7853 5.27375 18.7968 6.0315C18.8528 6.9895 18.8528 7.3025 18.8528 9.7425C18.8528 12.1825 18.8388 12.5025 18.7968 13.4495C18.7819 14.1977 18.6399 14.9379 18.3768 15.6385C17.9064 16.8462 16.9508 17.8011 15.7428 18.2705C15.043 18.5327 14.3039 18.6744 13.5568 18.6895C12.6018 18.7445 12.2888 18.7445 9.84277 18.7445ZM9.80877 2.2915C7.36277 2.2915 7.10877 2.3035 6.15377 2.3465C5.58376 2.35405 5.01925 2.45924 4.48477 2.6575C3.69553 2.95951 3.071 3.58149 2.76577 4.3695C2.56599 4.90979 2.46078 5.48047 2.45477 6.0565C2.40177 7.0255 2.40177 7.2795 2.40177 9.7085C2.40177 12.1085 2.41077 12.3995 2.45477 13.3625C2.46373 13.9327 2.56887 14.4973 2.76577 15.0325C3.07145 15.82 3.69587 16.4415 4.48477 16.7435C5.01889 16.9431 5.58362 17.0483 6.15377 17.0545C7.12177 17.1105 7.37677 17.1105 9.80877 17.1105C12.2618 17.1105 12.5158 17.0985 13.4628 17.0545C14.0332 17.0476 14.5981 16.9423 15.1328 16.7435C15.9172 16.4389 16.5377 15.8188 16.8428 15.0345C17.0422 14.4937 17.1474 13.9228 17.1538 13.3465H17.1648C17.2078 12.3905 17.2078 12.1355 17.2078 9.6925C17.2078 7.2495 17.1968 6.9925 17.1538 6.0375C17.1448 5.46795 17.0397 4.90401 16.8428 4.3695C16.5384 3.58407 15.9178 2.96279 15.1328 2.6575C14.5982 2.45824 14.0332 2.35302 13.4628 2.3465C12.4958 2.2915 12.2428 2.2915 9.80877 2.2915ZM9.84277 14.3275C7.97276 14.3287 6.28619 13.2032 5.56964 11.476C4.85308 9.74867 5.24768 7.75983 6.56941 6.43696C7.89113 5.11409 9.87964 4.71777 11.6075 5.43283C13.3354 6.14789 14.4624 7.83349 14.4628 9.7035C14.46 12.2546 12.3938 14.3225 9.84277 14.3275ZM9.84277 6.7015C8.18592 6.7015 6.84277 8.04464 6.84277 9.7015C6.84277 11.3584 8.18592 12.7015 9.84277 12.7015C11.4996 12.7015 12.8428 11.3584 12.8428 9.7015C12.8389 8.04624 11.498 6.70535 9.84277 6.7015ZM14.6428 5.9885C14.0482 5.98629 13.5677 5.50308 13.5688 4.9085C13.5699 4.31392 14.0522 3.8325 14.6468 3.8325C15.2414 3.8325 15.7237 4.31392 15.7248 4.9085C15.725 5.19536 15.6111 5.47052 15.408 5.67317C15.205 5.87583 14.9296 5.98929 14.6428 5.9885Z"
                  fill="#6D74B9"
                />
              </svg>
            </SocialMediaButton>
          </div>

          {/* Language Selector */}
          <div className="flex flex-col gap-2 absolute bottom-8 left-5 right-5 pt-4 border-t border-[#6D74B9]">
            <div className="flex gap-8 justify-between">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={`w-full text-center flex items-center gap-2 border-2 text-white px-4 py-2 rounded-[12px] transition-all duration-300 font-sans bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-transparent hover:border-[#262957] hover:from-transparent hover:to-transparent`}
                  aria-label={`Switch to ${option.label}`}
                  aria-pressed={language === option.value}
                >
                  <span className="w-full text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
});

MobileMenu.displayName = "MobileMenu";
