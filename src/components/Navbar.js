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
          <a className="text-[#1a1c18]/60 hover:text-[#1a1c18] transition-colors text-sm font-medium cursor-pointer">Stats</a>
        </nav>

        <div className="flex items-center gap-4 text-[#1a1c18]/60">
          <button className="hover:text-[#1a1c18] transition-colors"><i className="fa-regular fa-bell"></i></button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#383a35]">
            <img 
              alt="Student profile picture" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLLV308CfVHdM4Tl4QiujlO8M_nEsuUcx381PJz3xZ3f5yZ5fAskIsPvUjB6bmkRv2h_J5dG7sYRYw3jQKic_4oS55H1GyKwd0pBXRDlpVE2HosX8byA_LkAiXMbYtPb5znDFwhgGeNJQYUuuHuubsHcRV4ijx1bopZmFP3aSB15bmhouliA5jKygE0YGIKoGeDA9w-OT38-YoIIO_cf0EHWfnLL-BX4Wc2S5KUENExDeGdmadh3_wTaFDf5pPGtRw0hWyFSFXsaM"
            />
          </div>
        </div>
      </header>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white text-gray-500 py-3 px-6 flex justify-between items-center rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 border-t border-[#1a1c18]/10">
        <Link href="/" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/" ? "text-[#d4ff33]" : "hover:text-[#1a1c18]"}`}>
          <i className="fa-solid fa-robot text-xl"></i>
        </Link>
        <Link href="/quiz" className={`transition-colors flex flex-col items-center gap-1 ${pathname === "/quiz" ? "text-[#d4ff33]" : "hover:text-[#1a1c18]"}`}>
          <i className="fa-solid fa-book text-xl"></i>
        </Link>
        <a className="hover:text-[#1a1c18] transition-colors flex flex-col items-center gap-1 cursor-pointer">
          <i className="fa-solid fa-chart-line text-xl"></i>
        </a>
      </nav>
    </>
  );
}

