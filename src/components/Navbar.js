"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Lottie from "lottie-react";
import avatarAnimation from "../../public/avatar.json";

export default function Navbar({ isTalking, mobileLottieRef }) {
  const pathname = usePathname();

  return (
    <>
      {/* TopAppBar Shell */}
      <header className="sticky top-0 z-50 bg-[#dfd5bb]/80 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm w-full border-b border-[#1a1c18]/10">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-gray-400 hover:text-[#1a1c18] transition-colors">
            <i className="fa-solid fa-chevron-left text-lg"></i>
          </button>
          <h1 className="text-xl font-bold text-[#1a1c18]">EduMate AI</h1>
          
          {/* Mobile Avatar Badge */}
          {mobileLottieRef && (
            <div className="flex md:hidden items-center gap-2 bg-[#1a1c18]/5 px-2.5 py-1 rounded-full border border-[#1a1c18]/10">
              <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                <Lottie
                  lottieRef={mobileLottieRef}
                  animationData={avatarAnimation}
                  loop={true}
                  autoplay={false}
                  style={{ width: 32, height: 32 }}
                />
              </div>
              <span className="text-[10px] font-semibold text-[#1a1c18]">{isTalking ? "Speaking" : "Ready"}</span>
            </div>
          )}
        </div>

        {/* Desktop Nav Integration */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`transition-colors text-sm font-medium ${
              pathname === "/"
                ? "text-[#1a1c18] font-bold border-b-2 border-[#1a1c18]"
                : "text-[#1a1c18]/60 hover:text-[#1a1c18]"
            }`}
          >
            Tutor
          </Link>
          <Link
            href="/quiz"
            className={`transition-colors text-sm font-medium ${
              pathname === "/quiz"
                ? "text-[#1a1c18] font-bold border-b-2 border-[#1a1c18]"
                : "text-[#1a1c18]/60 hover:text-[#1a1c18]"
            }`}
          >
            Subjects
          </Link>
          <Link
            href="/stats"
            className={`transition-colors text-sm font-medium ${
              pathname === "/stats"
                ? "text-[#1a1c18] font-bold border-b-2 border-[#1a1c18]"
                : "text-[#1a1c18]/60 hover:text-[#1a1c18]"
            }`}
          >
            Stats
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-[#1a1c18]/60">
          <button className="hover:text-[#1a1c18] transition-colors"><i className="fa-regular fa-bell"></i></button>
            <div className="hidden md:flex w-9 h-9 rounded-full overflow-hidden border-2 border-[#1a1c18]/10 cursor-pointer hover:border-[#1a1c18]/30 transition-all">
              <img
                alt="School Logo"
                className="w-full h-full object-cover"
                src="/school_logo.png"
              />
            </div>
        </div>
      </header>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white text-gray-500 py-3 px-6 flex justify-between items-center rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 border-t border-[#1a1c18]/10">
        <Link href="/" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/" ? "text-[#f07723]" : "hover:text-[#1a1c18]"}`}>
          <i className="fa-solid fa-robot text-xl"></i>
        </Link>
        <Link href="/quiz" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/quiz" ? "text-[#f07723]" : "hover:text-[#1a1c18]"}`}>
          <i className="fa-solid fa-book text-xl"></i>
        </Link>
        <Link href="/stats" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/stats" ? "text-[#f07723]" : "hover:text-[#1a1c18]"}`}>
          <i className="fa-solid fa-chart-line text-xl"></i>
        </Link>
      </nav>
    </>
  );
}

