"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ handleGenerateQuests, clearChat, handleCreateQuiz }) {
  const pathname = usePathname();
  const { sessions, isLoadingSessions, removeSession } = useAuth();

  const handleDeleteSession = async (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    await removeSession(sessionId);
  };

  return (
    <aside className="hidden md:flex flex-col h-screen py-6 px-4 bg-[#ffb266] backdrop-blur-sm w-72 border-r border-[#0b1c30]/10 flex-shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-[#727785]">
          <img
            alt="School Logo"
            className="w-full h-full object-cover"
            src="/school_logo.png"
          />
        </div>
        <div>
          <p className="text-base font-semibold text-[#0b1c30]">EduMate AI</p>
          <p className="text-xs font-medium text-[#0b1c30]/60">Govt. Sr. Sec. School</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
        {/* Primary Navigation */}
        <Link 
          href="/"
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl group cursor-pointer ${pathname === '/' ? 'bg-[#0b1c30]/10 text-[#0b1c30] font-bold' : 'text-[#0b1c30]/70 hover:bg-[#0b1c30]/5 hover:text-[#0b1c30]'}`}
        >
          <i className={`fa-solid fa-robot w-5 text-center ${pathname === '/' ? 'text-[#0b1c30]' : 'text-[#0b1c30]/60 group-hover:text-[#0b1c30]'}`}></i>
          <span className="text-sm">Tutor</span>
        </Link>
        <Link 
          href="/quiz"
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl group cursor-pointer ${pathname === '/quiz' ? 'bg-[#0b1c30]/10 text-[#0b1c30] font-bold' : 'text-[#0b1c30]/70 hover:bg-[#0b1c30]/5 hover:text-[#0b1c30]'}`}
        >
          <i className={`fa-solid fa-book w-5 text-center ${pathname === '/quiz' ? 'text-[#0b1c30]' : 'text-[#0b1c30]/60 group-hover:text-[#0b1c30]'}`}></i>
          <span className="text-sm">Subjects & Quizzes</span>
        </Link>
        <Link 
          href="/stats"
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl group cursor-pointer ${pathname === '/stats' ? 'bg-[#0b1c30]/10 text-[#0b1c30] font-bold' : 'text-[#0b1c30]/70 hover:bg-[#0b1c30]/5 hover:text-[#0b1c30]'}`}
        >
          <i className={`fa-solid fa-chart-pie w-5 text-center ${pathname === '/stats' ? 'text-[#0b1c30]' : 'text-[#0b1c30]/60 group-hover:text-[#0b1c30]'}`}></i>
          <span className="text-sm">Teacher Analytics</span>
        </Link>

        {isLoadingSessions ? (
          <>
            <div className="h-px bg-[#0b1c30]/10 my-2"></div>
            <p className="text-xs font-bold text-[#0b1c30]/50 uppercase tracking-wider px-4 mt-2 mb-2">Recent Chats</p>
            <div className="flex flex-col gap-2 px-4">
              <div className="h-6 bg-[#0b1c30]/10 rounded animate-pulse w-3/4"></div>
              <div className="h-6 bg-[#0b1c30]/10 rounded animate-pulse w-full"></div>
              <div className="h-6 bg-[#0b1c30]/10 rounded animate-pulse w-5/6"></div>
            </div>
          </>
        ) : sessions.length > 0 && (
          <>
            <div className="h-px bg-[#0b1c30]/10 my-2"></div>
            <p className="text-xs font-bold text-[#0b1c30]/50 uppercase tracking-wider px-4 mt-2 mb-1">Recent Chats</p>
            {sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between group px-4 py-2 hover:bg-[#0b1c30]/5 rounded-xl transition-all">
                <Link href={`/?sessionId=${session.id}`} className="flex-1 overflow-hidden">
                  <p className="text-sm text-[#0b1c30]/80 truncate font-medium">{session.title}</p>
                </Link>
                <button 
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                  title="Delete Chat"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            ))}
          </>
        )}

        <div className="h-px bg-[#0b1c30]/10 my-4"></div>

        {/* Action Navigation */}
        {handleGenerateQuests ? (
          <button 
            onClick={handleGenerateQuests}
            className="flex items-center gap-3 px-4 py-3 text-[#0b1c30]/70 hover:bg-[#0b1c30]/10 hover:text-[#0b1c30] transition-all rounded-xl group cursor-pointer"
          >
            <i className="fa-solid fa-award text-[#0b1c30]/60 group-hover:text-warning w-5 text-center"></i>
            <span className="text-sm font-medium">Daily Quests</span>
          </button>
        ) : (
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-[#0b1c30]/70 hover:bg-[#0b1c30]/10 hover:text-[#0b1c30] transition-all rounded-xl group cursor-pointer"
          >
            <i className="fa-solid fa-award text-[#0b1c30]/60 group-hover:text-warning w-5 text-center"></i>
            <span className="text-sm font-medium">Daily Quests</span>
          </Link>
        )}

        <Link href="/settings" className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl group cursor-pointer ${pathname === '/settings' ? 'bg-[#0b1c30]/10 text-[#0b1c30] font-bold' : 'text-[#0b1c30]/70 hover:bg-[#0b1c30]/5 hover:text-[#0b1c30]'}`}>
          <i className={`fa-solid fa-gear w-5 text-center ${pathname === '/settings' ? 'text-[#0b1c30]' : 'text-[#0b1c30]/60 group-hover:text-[#0b1c30]'}`}></i>
          <span className="text-sm font-medium">Settings</span>
        </Link>
        
        <button className="flex items-center gap-3 px-4 py-3 text-[#0b1c30]/70 hover:bg-[#0b1c30]/10 hover:text-[#0b1c30] transition-all rounded-xl group cursor-pointer">
          <i className="fa-solid fa-circle-question text-[#0b1c30]/60 group-hover:text-[#0b1c30] w-5 text-center"></i>
          <span className="text-sm font-medium">Help</span>
        </button>

        {clearChat && (
          <button 
            onClick={clearChat}
            className="flex items-center gap-3 px-4 py-3 text-[#0b1c30]/70 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-xl group cursor-pointer mt-auto"
          >
            <i className="fa-solid fa-rotate-right text-[#0b1c30]/60 group-hover:text-red-500 w-5 text-center"></i>
            <span className="text-sm font-medium">New Chat</span>
          </button>
        )}
        
        {handleCreateQuiz && (
          <button 
            onClick={handleCreateQuiz}
            className="flex items-center gap-3 px-4 py-3 bg-[#006b2d] text-white hover:bg-[#005321] transition-all rounded-xl group cursor-pointer mt-4 shadow-sm"
          >
            <i className="fa-solid fa-bolt text-white w-5 text-center"></i>
            <span className="text-sm font-bold">Quiz Me on this!</span>
          </button>
        )}
      </nav>
    </aside>
  );
}
