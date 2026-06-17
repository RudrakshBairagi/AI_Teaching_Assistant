"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
        💬 Tutor Chat
      </Link>
      <Link href="/quiz" className={`nav-link ${pathname === "/quiz" ? "active" : ""}`}>
        📝 Practice Quiz
      </Link>
    </nav>
  );
}
