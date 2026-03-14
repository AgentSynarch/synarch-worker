import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import logo from "@/assets/logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "404 — SYNARCH";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Ghost logo */}
        <img src={logo} alt="SYNARCH" className="w-16 h-16 mb-8 opacity-20" />

        {/* Error code */}
        <h1 className="font-mono text-[8rem] leading-none font-light tracking-tighter text-neutral-900 select-none">
          404
        </h1>

        {/* Divider */}
        <div className="w-12 h-px bg-neutral-200 my-6" />

        {/* Message */}
        <p className="text-sm text-neutral-400 tracking-wide uppercase mb-2">
          Route not found
        </p>
        <p className="text-xs text-neutral-300 font-mono mb-10 max-w-xs">
          {location.pathname}
        </p>

        {/* Return button */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-200"
        >
          <span className="opacity-50 group-hover:opacity-100 transition-opacity">←</span>
          Return to network
        </Link>
      </div>

      {/* Bottom branding */}
      <p className="absolute bottom-8 text-[10px] text-neutral-300 font-mono tracking-[0.3em] uppercase">
        SYNARCH
      </p>
    </div>
  );
};

export default NotFound;
