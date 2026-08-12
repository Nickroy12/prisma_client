"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      const raw = localStorage.getItem("user");
      if (raw) { try { setUser(JSON.parse(raw)); } catch { setUser(null); } }
      else { setUser(null); }
    };

    // Read on mount and on every route change
    syncUser();

    // Also react to storage changes (login/logout in same or other tab)
    window.addEventListener("storage", syncUser);
    // React to custom event dispatched right after login/logout
    window.addEventListener("auth-change", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear the cookie so Server Components also lose auth
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    setUser(null);
    setMenuOpen(false);
    setMobileOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/auth/SignIn");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin", badge: "Admin" }] : []),
];

  return (
    <>
      {/* ── Navbar bar ── */}
      <nav className={`sticky top-0 z-[100] flex items-center justify-between px-8 h-16 border-b border-white/[0.07] backdrop-blur-xl transition-all duration-300 font-sans ${scrolled ? "bg-[#0d0f1a]/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "bg-[#0d0f1a]/60"}`}>

        {/* Brand */}
        <Link href="/" id="nav-brand" className="flex items-center gap-2.5 no-underline shrink-0">
          <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center p-[7px] text-white shrink-0 [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[1.1rem] font-bold text-[#e8eaf6] tracking-tight">Prisma</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} current={pathname} badge={(link as { badge?: string }).badge} />
          ))}
        </div>

        {/* Desktop right auth area */}
        <div className="hidden md:flex items-center shrink-0">
          {user ? (
            <div className="relative">
              <button id="nav-user-btn" aria-expanded={menuOpen} aria-haspopup="true"
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] rounded-[10px] py-[5px] pl-[6px] pr-3 cursor-pointer text-[#e8eaf6] hover:bg-white/10 hover:border-white/[0.18] transition-all">
                {user.avatar
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={user.avatar} alt={user.name} className="w-[30px] h-[30px] rounded-lg object-cover" />
                  : <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[0.72rem] font-bold text-white shrink-0 [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)]">{initials}</span>
                }
                <span className="text-sm font-medium max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">{user.name.split(" ")[0]}</span>
                <svg className={`transition-transform duration-200 text-[#7c83a0] ${menuOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div role="menu" className="dropdown-anim absolute top-[calc(100%+8px)] right-0 w-[220px] bg-[#161829] border border-white/10 rounded-[14px] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-[200]">
                  <div className="px-3 pt-2.5 pb-2">
                    <p className="text-sm font-semibold text-[#e8eaf6] mb-0.5">{user.name}</p>
                    <p className="text-xs text-[#7c83a0] mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-widest bg-[rgba(124,108,248,0.18)] text-[#a78bfa] border border-[rgba(124,108,248,0.3)]">{user.role}</span>
                  </div>
                  <div className="h-px bg-white/[0.07] my-1" />
                  <Link href="/profile" role="menuitem" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[9px] text-sm font-medium text-[#b0b5cc] no-underline hover:bg-white/[0.07] hover:text-[#e8eaf6] transition-all [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    Profile
                  </Link>
                  <button id="nav-logout-btn" role="menuitem" onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[9px] text-sm font-medium text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 hover:text-red-300 transition-all text-left [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/auth/SignIn" id="nav-signin-btn" className="px-[18px] py-[7px] rounded-lg text-sm font-medium text-[#b0b5cc] no-underline hover:text-[#e8eaf6] hover:bg-white/[0.07] transition-all">Sign In</Link>
              <Link href="/auth/SignUp" id="nav-signup-btn" className="px-5 py-[7px] rounded-lg text-sm font-semibold text-white no-underline [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)] shadow-[0_2px_12px_rgba(124,108,248,0.35)] hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_18px_rgba(124,108,248,0.5)] transition-all">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <button id="nav-hamburger" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden flex flex-col justify-center gap-[5px] bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors w-[38px] h-[38px]">
          <span className={`block w-[22px] h-0.5 bg-[#b0b5cc] rounded-sm transition-transform duration-300 origin-center ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block w-[22px] h-0.5 bg-[#b0b5cc] rounded-sm transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-[22px] h-0.5 bg-[#b0b5cc] rounded-sm transition-transform duration-300 origin-center ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* ── Mobile backdrop ── */}
      <div onClick={() => setMobileOpen(false)} aria-hidden="true"
        className={`md:hidden fixed inset-0 z-[150] bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />

      {/* ── Mobile drawer ── */}
      <div aria-hidden={!mobileOpen}
        className={`md:hidden fixed top-0 right-0 h-[100dvh] z-[200] bg-[#111320] border-l border-white/[0.08] flex flex-col p-6 pb-8 gap-0 overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-[min(320px,85vw)] ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Drawer user / auth */}
        {user ? (
          <div className="flex items-center gap-3 py-3 pb-4 flex-wrap">
            {user.avatar
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.avatar} alt={user.name} className="w-[42px] h-[42px] rounded-[10px] object-cover" />
              : <span className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-[0.85rem] font-bold text-white [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)]">{initials}</span>
            }
            <div>
              <p className="text-[0.95rem] font-semibold text-[#e8eaf6]">{user.name}</p>
              <p className="text-xs text-[#7c83a0] mt-0.5 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</p>
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-widest bg-[rgba(124,108,248,0.18)] text-[#a78bfa] border border-[rgba(124,108,248,0.3)]">{user.role}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 py-3 pb-4">
            <Link href="/auth/SignIn" onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-[11px] rounded-[10px] text-[0.9rem] font-medium text-[#b0b5cc] no-underline border border-white/10 hover:bg-white/[0.07] hover:text-[#e8eaf6] transition-all">
              Sign In
            </Link>
            <Link href="/auth/SignUp" onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-[11px] rounded-[10px] text-[0.9rem] font-semibold text-white no-underline [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)] shadow-[0_2px_14px_rgba(124,108,248,0.35)] hover:opacity-90 transition-all">
              Sign Up
            </Link>
          </div>
        )}

        <div className="h-px bg-white/[0.07] my-1.5" />

        {/* Drawer nav links */}
        <nav className="flex flex-col gap-0.5 py-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} id={`drawer-link-${link.label.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-[10px] text-[0.95rem] font-medium no-underline transition-all ${isActive ? "bg-[rgba(124,108,248,0.12)] text-[#c4b5fd]" : "text-[#7c83a0] hover:bg-white/[0.06] hover:text-[#e8eaf6]"}`}>
                {link.label}
                {(link as { badge?: string }).badge && (
                  <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold tracking-widest bg-[rgba(124,108,248,0.2)] text-[#a78bfa] border border-[rgba(124,108,248,0.3)]">
                    {(link as { badge?: string }).badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {user && (
          <>
            <div className="h-px bg-white/[0.07] my-1.5" />
            <button id="drawer-logout-btn" onClick={handleLogout}
              className="flex items-center gap-2.5 mt-2 w-full px-3.5 py-3 rounded-[10px] text-[0.9rem] font-medium text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 hover:text-red-300 transition-all text-left [&>svg]:w-[18px] [&>svg]:h-[18px]">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
              Sign out
            </button>
          </>
        )}
      </div>

      {/* Dropdown backdrop */}
      {menuOpen && <div className="fixed inset-0 z-[99]" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

/* ── NavLink ── */
function NavLink({ href, label, current, badge }: { href: string; label: string; current: string; badge?: string }) {
  const isActive = current === href;
  return (
    <Link href={href} id={`nav-link-${label.toLowerCase()}`}
      className={`flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-sm font-medium no-underline whitespace-nowrap tracking-wide transition-all ${isActive ? "text-[#e8eaf6] bg-white/[0.08] font-semibold" : "text-[#7c83a0] hover:text-[#e8eaf6] hover:bg-white/[0.06]"}`}>
      {label}
      {badge && (
        <span className="px-[7px] py-px rounded-full text-[0.6rem] font-bold tracking-widest bg-[rgba(124,108,248,0.2)] text-[#a78bfa] border border-[rgba(124,108,248,0.3)]">
          {badge}
        </span>
      )}
    </Link>
  );
}
