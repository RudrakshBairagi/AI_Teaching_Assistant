"use client";

import { useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function Settings() {
  const { appLanguage, changeLanguage, t } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    // Mock logout logic: redirect to the home page (which could be the login page later)
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full relative pb-20 md:pb-0">
        <Sidebar />
        
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 gap-8">
        <div className="header text-left">
          <h1 className="text-3xl font-bold text-theme-text flex items-center gap-3">
            <i className="fa-solid fa-gear text-theme-text/80 drop-shadow-md"></i>
            {t("settings.title")}
          </h1>
          <p className="text-theme-text/60 mt-1 font-medium">{t("settings.subtitle")}</p>
        </div>

        <div className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-sm flex flex-col gap-8">
          
          {/* Language Preferences */}
          <section className="flex flex-col gap-4 border-b border-theme-border pb-8">
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <div className="bg-theme-sidebar w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-language text-[#f47920]"></i> 
              </div>
              {t("settings.lang.title")}
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10">
              <div>
                <p className="font-semibold text-theme-text">{t("settings.lang.app")}</p>
                <p className="text-sm text-theme-text-muted">{t("settings.lang.desc")}</p>
              </div>
              <select 
                className="w-full md:w-48 p-3 rounded-xl border border-theme-border bg-theme-bg text-sm font-semibold text-theme-text cursor-pointer outline-none focus:border-[#f47920] transition-colors"
                value={appLanguage}
                onChange={handleLanguageChange}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </section>

          {/* Appearance */}
          <section className="flex flex-col gap-4 border-b border-theme-border pb-8">
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <div className="bg-theme-sidebar w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-palette text-[#f47920]"></i> 
              </div>
              {t("settings.appearance.title")}
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10">
              <div>
                <p className="font-semibold text-theme-text">{t("settings.appearance.dark")}</p>
                <p className="text-sm text-theme-text-muted">{t("settings.appearance.desc")}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={(e) => toggleDarkMode(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-theme-sidebar"></div>
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex flex-col gap-4 border-b border-theme-border pb-8">
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <div className="bg-theme-sidebar w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-bell text-[#f47920]"></i> 
              </div>
              {t("settings.notifs.title")}
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10 mb-2 md:mb-4">
              <div>
                <p className="font-semibold text-theme-text">{t("settings.notifs.email")}</p>
                <p className="text-sm text-theme-text-muted">{t("settings.notifs.email.desc")}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-theme-sidebar"></div>
              </label>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-0 md:ml-10">
              <div>
                <p className="font-semibold text-theme-text">{t("settings.notifs.push")}</p>
                <p className="text-sm text-theme-text-muted">{t("settings.notifs.push.desc")}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-theme-sidebar"></div>
              </label>
            </div>
          </section>

          {/* Account Management */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <div className="bg-theme-sidebar w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user-shield text-[#f47920]"></i> 
              </div>
              Account Management
            </h2>
            <div className="ml-0 md:ml-10 mt-2">
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-xl transition-all cursor-pointer border border-red-200 w-full md:w-auto justify-center"
              >
                <i className="fa-solid fa-right-from-bracket"></i> {t("settings.logout")}
              </button>
            </div>
          </section>
        </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-sm transition-opacity">
          <div className="bg-theme-card rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
            <h2 className="text-xl font-bold text-theme-text mb-2">Ready to leave?</h2>
            <p className="text-sm text-theme-text-muted mb-8">
              Are you sure you want to log out of your account? You will need to sign in again to access your progress.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-theme-text/70 hover:bg-theme-bg transition-colors cursor-pointer"
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
