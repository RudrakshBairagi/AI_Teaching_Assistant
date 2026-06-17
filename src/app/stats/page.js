"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";

// Mock data
const mockStats = {
  overview: {
    totalQueries: 1432,
    activeStudents: 38,
    avgQuizScore: 78
  },
  subjects: [
    {
      name: "Science",
      icon: "fa-flask",
      color: "text-blue-500",
      bg: "bg-blue-100",
      chapters: [
        { name: "Matter in Our Surroundings", progress: 85 },
        { name: "Is Matter Around Us Pure?", progress: 60 },
        { name: "Atoms and Molecules", progress: 45 }
      ]
    },
    {
      name: "Mathematics",
      icon: "fa-calculator",
      color: "text-red-500",
      bg: "bg-red-100",
      chapters: [
        { name: "Number Systems", progress: 92 },
        { name: "Polynomials", progress: 75 },
        { name: "Coordinate Geometry", progress: 30 }
      ]
    },
    {
      name: "Social Science",
      icon: "fa-globe",
      color: "text-green-500",
      bg: "bg-green-100",
      chapters: [
        { name: "The French Revolution", progress: 88 },
        { name: "Socialism in Europe", progress: 50 }
      ]
    },
    {
      name: "English",
      icon: "fa-book-open",
      color: "text-purple-500",
      bg: "bg-purple-100",
      chapters: [
        { name: "The Fun They Had", progress: 95 },
        { name: "The Sound of Music", progress: 80 }
      ]
    }
  ]
};

export default function Stats() {
  const [selectedClass, setSelectedClass] = useState("Class 9");
  const [selectedSection, setSelectedSection] = useState("A");

  return (
    <div className="min-h-screen flex flex-col bg-[#dfd5bb] text-[#1a1c18] font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 gap-8 pb-24 md:pb-8">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-3xl border border-[#1a1c18]/10 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1c18] flex items-center gap-3">
              <i className="fa-solid fa-chart-pie text-[#d4ff33] drop-shadow-md"></i>
              Teacher Analytics
            </h1>
            <p className="text-[#1a1c18]/60 mt-1 font-medium">Monitor student progress and AI Tutor engagement.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-40">
              <label className="text-xs font-bold text-[#1a1c18]/50 uppercase tracking-wider">Class</label>
              <select 
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-[#1a1c18] cursor-pointer outline-none focus:border-[#1a1c18] transition-colors"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full md:w-32">
              <label className="text-xs font-bold text-[#1a1c18]/50 uppercase tracking-wider">Section</label>
              <select 
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-[#1a1c18] cursor-pointer outline-none focus:border-[#1a1c18] transition-colors"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#1a1c18]/10 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-[#d4ff33]/20 flex items-center justify-center text-[#292b27] group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-comments text-2xl"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1c18]/50 uppercase tracking-wider">Total AI Queries</p>
              <h3 className="text-3xl font-black text-[#1a1c18]">{mockStats.overview.totalQueries}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-[#1a1c18]/10 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-[#dfd5bb]/40 flex items-center justify-center text-[#292b27] group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-users text-2xl"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1c18]/50 uppercase tracking-wider">Active Students</p>
              <h3 className="text-3xl font-black text-[#1a1c18]">{mockStats.overview.activeStudents} <span className="text-sm text-gray-400 font-medium">/ 40</span></h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#1a1c18]/10 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-bullseye text-2xl"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1c18]/50 uppercase tracking-wider">Avg Quiz Score</p>
              <h3 className="text-3xl font-black text-[#1a1c18]">{mockStats.overview.avgQuizScore}%</h3>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <h2 className="text-xl font-bold text-[#1a1c18] mt-4 flex items-center gap-2">
          <i className="fa-solid fa-book-open-reader text-gray-400"></i> Subject Completion Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockStats.subjects.map((subject, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-[#1a1c18]/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${subject.bg} ${subject.color} flex items-center justify-center`}>
                  <i className={`fa-solid ${subject.icon} text-lg`}></i>
                </div>
                <h3 className="text-lg font-bold text-[#1a1c18]">{subject.name}</h3>
              </div>
              
              <div className="flex flex-col gap-5">
                {subject.chapters.map((chap, cIdx) => (
                  <div key={cIdx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-[#1a1c18]/80">{chap.name}</span>
                      <span className="font-bold text-[#1a1c18]">{chap.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${chap.progress > 80 ? 'bg-[#d4ff33]' : chap.progress > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${chap.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
