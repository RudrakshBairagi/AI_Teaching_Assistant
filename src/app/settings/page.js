"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function Settings() {
  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Mock logout logic: redirect to the home page (which could be the login page later)
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4ee] text-[#0b1c30] font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full relative pb-20 md:pb-0">
        <Sidebar />
        
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 gap-8">
        <div className="header text-left">
          <h1 className="text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <i className="fa-solid fa-gear text-[#0b1c30]/80 drop-shadow-md"></i>
            Settings
          </h1>
          <p className="text-[#0b1c30]/60 mt-1 font-medium">Manage your account preferences and app behavior.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#0b1c30]/10 shadow-sm flex flex-col gap-8">
          
          {/* Language Preferences */}
          <section className="flex flex-col gap-4 border-b border-[#0b1c30]/10 pb-8">
            <h2 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <div className="bg-[#0b1c30] w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-language text-[#f47920]"></i> 
              </div>
              Language Preferences
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10">
              <div>
                <p className="font-semibold text-[#0b1c30]">App Language</p>
                <p className="text-sm text-gray-500">Select the primary language for the application interface.</p>
              </div>
              <select 
                className="w-full md:w-48 p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-[#0b1c30] cursor-pointer outline-none focus:border-[#0b1c30] transition-colors"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </section>

          {/* Appearance */}
          <section className="flex flex-col gap-4 border-b border-[#0b1c30]/10 pb-8">
            <h2 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <div className="bg-[#0b1c30] w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-palette text-[#f47920]"></i> 
              </div>
              Appearance
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10">
              <div>
                <p className="font-semibold text-[#0b1c30]">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle dark mode for a better nighttime experience.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0b1c30]"></div>
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex flex-col gap-4 border-b border-[#0b1c30]/10 pb-8">
            <h2 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <div className="bg-[#0b1c30] w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-bell text-[#f47920]"></i> 
              </div>
              Notifications
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10 mb-2 md:mb-4">
              <div>
                <p className="font-semibold text-[#0b1c30]">Email Summaries</p>
                <p className="text-sm text-gray-500">Receive weekly summaries of your learning progress.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0b1c30]"></div>
              </label>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10">
              <div>
                <p className="font-semibold text-[#0b1c30]">Push Notifications</p>
                <p className="text-sm text-gray-500">Get reminders for your daily quests and practice sessions.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0b1c30]"></div>
              </label>
            </div>
          </section>

          {/* Account Management */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <div className="bg-[#0b1c30] w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user-shield text-[#f47920]"></i> 
              </div>
              Account Management
            </h2>
            <div className="ml-0 md:ml-10 mt-2">
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-xl transition-all cursor-pointer border border-red-200 w-full md:w-auto justify-center"
              >
                <i className="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          </section>
        </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
            <h2 className="text-xl font-bold text-[#0b1c30] mb-2">Ready to leave?</h2>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to log out of your account? You will need to sign in again to access your progress.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[#0b1c30]/70 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
