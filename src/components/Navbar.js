"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Lottie from "lottie-react";
import avatarAnimation from "../../public/avatar.json";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({ isTalking, mobileLottieRef }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <>
      {/* TopAppBar Shell (Mobile Only) */}
      <header className="md:hidden sticky top-0 z-50 bg-[#ffb266]/80 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm w-full border-b border-theme-border">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-theme-text transition-colors">
            <i className="fa-solid fa-chevron-left text-lg"></i>
          </button>
          <h1 className="text-xl font-bold text-theme-text">{t("navbar.title")}</h1>
          
          {/* Mobile Avatar Badge */}
          {mobileLottieRef && (
            <div className="flex items-center gap-2 bg-theme-sidebar/5 px-2.5 py-1 rounded-full border border-theme-border">
              <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                <Lottie
                  lottieRef={mobileLottieRef}
                  animationData={avatarAnimation}
                  loop={true}
                  autoplay={false}
                  style={{ width: 32, height: 32 }}
                />
              </div>
              <span className="text-[10px] font-semibold text-theme-text">{isTalking ? "Speaking" : "Ready"}</span>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-theme-card text-theme-text-muted py-3 px-6 flex justify-between items-center rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 border-t border-theme-border">
        <Link href="/" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/" ? "text-[#f47920]" : "hover:text-theme-text"}`}>
          <i className="fa-solid fa-robot text-xl"></i>
        </Link>
        <Link href="/quiz" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/quiz" ? "text-[#f47920]" : "hover:text-theme-text"}`}>
          <i className="fa-solid fa-book text-xl"></i>
        </Link>
        <Link href="/stats" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/stats" ? "text-[#f47920]" : "hover:text-theme-text"}`}>
          <i className="fa-solid fa-chart-line text-xl"></i>
        </Link>
      </nav>
    </>
  );
}

