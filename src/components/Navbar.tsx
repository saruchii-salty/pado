import React from 'react';
import { NAV_ITEMS } from '../data/chapters';

interface NavbarProps {
  scrollProgress: number;
  isNightSection: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrollProgress, isNightSection }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // 각 섹션 높이가 560vh라 2배 높이만큼 내려서 중앙 맞춤
      const targetY = el.offsetTop + Math.round(window.innerHeight * 2.0);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-500 border-b ${
        isNightSection
          ? 'bg-[#0D1320]/94 border-white/10 text-[#F9FAFB]'
          : 'bg-[#F9FAFB]/94 border-[#191F28]/6 text-[#191F28]'
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-2.5">
        <a
          href="#chapter-hero"
          aria-label="파도 홈으로 이동"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3182F6]"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="36" height="36" rx="10.5" fill="#3182F6" />
            <path
              d="M9 19.125C13.5 12.75 18 12.75 18 18C18 23.25 22.5 23.25 27 16.875"
              stroke="#FFFFFF"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
          </svg>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`cursor-pointer transition-colors duration-200 whitespace-nowrap shrink-0 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3182F6] ${
                isNightSection
                  ? 'text-[#CBD5E1] hover:text-white'
                  : 'text-[#4E5968] hover:text-[#191F28]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('chapter-finale')}
            className="cursor-pointer rounded-full bg-[#3182F6] px-4 py-1.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#1B64DA] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182F6]"
          >
            앱 받아보기
          </button>
        </div>
      </div>

      <div className="h-[2px] w-full bg-transparent">
        <div
          className="h-full bg-[#3182F6] origin-left will-change-transform"
          style={{ transform: `scaleX(${Math.max(0.01, scrollProgress)})` }}
        />
      </div>
    </header>
  );
};
