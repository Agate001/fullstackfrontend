"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Users, LogOut, Menu, X } from "lucide-react";

const NavBarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/home",
      label: "Home",
      icon: Home,
    },
    {
      href: "/schedule",
      label: "Schedule",
      icon: CalendarDays,
    },
    {
      href: "/friends",
      label: "Friends",
      icon: Users,
    },
  ];

  return (
    <nav className="mb-6 w-full rounded-xl border border-orange-100 bg-[#fffaf1]/80 px-4 py-4 shadow-sm sm:px-6">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/home"
          className="text-2xl font-bold tracking-tight text-black sm:text-3xl"
        >
          StudySync
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-orange-100 text-orange-700 shadow-sm"
                    : "text-black hover:bg-orange-100"
                }`}
              >
                <Icon
                  size={17}
                  className={isActive ? "text-orange-700" : "text-orange-600"}
                />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Logout */}
        <Link
          href="/"
          className="hidden items-center gap-2 rounded-lg border border-orange-100 bg-[#fff7ec] px-5 py-2 text-sm font-medium text-black transition hover:bg-orange-100 md:flex"
        >
          <LogOut size={16} className="text-orange-600" />
          Logout
        </Link>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg border border-orange-100 bg-[#fff7ec] p-2 text-black transition hover:bg-orange-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <X size={22} className="text-orange-600" />
          ) : (
            <Menu size={22} className="text-orange-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-orange-100 pt-4 md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-orange-100 text-orange-700 shadow-sm"
                    : "text-black hover:bg-orange-50"
                }`}
              >
                <Icon
                  size={17}
                  className={isActive ? "text-orange-700" : "text-orange-600"}
                />
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg border border-orange-100 bg-[#fff7ec] px-4 py-3 text-sm font-medium text-black transition hover:bg-orange-100"
          >
            <LogOut size={16} className="text-orange-600" />
            Logout
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavBarComponent;