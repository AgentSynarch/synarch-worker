import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Agents", href: "/agents" },
  { label: "Blueprints", href: "/forks" },
  { label: "Docs", href: "/docs" },
  { label: "X", href: "/x" },
];

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-14">
        {/* Left nav links */}
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Synarch" className="w-8 h-8 object-contain" />
        </Link>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/launch"
            className="text-sm bg-neutral-900 hover:bg-neutral-700 text-white px-5 py-1.5 rounded-full transition-colors font-medium"
          >
            Launch Agent
          </Link>
        </div>
      </div>
    </nav>
  );
};
