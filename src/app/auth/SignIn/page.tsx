"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: { id: string; name: string; email: string; role: "USER" | "ADMIN"; avatar: string | null };
  };
  token?: string;
  user?: { id: string; name: string; email: string; role: "USER" | "ADMIN"; avatar: string | null };
}

export default function SignInPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const resData: ApiResponse = await res.json();
        if (!resData.success) { setError(resData.message || "Login failed."); return; }
        const token = resData.data?.token || resData.token;
        const user = resData.data?.user || resData.user;
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          // Also persist as a cookie so Next.js Server Components can read it
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          // Notify Navbar immediately
          window.dispatchEvent(new Event("auth-change"));
        }
        router.push("/");
      } catch { setError("Unable to reach the server. Please try again later."); }
    });
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#0d0f1a] px-4 py-6 overflow-hidden font-sans">
      {/* Blobs */}
      <div className="blob absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-35 top-[-150px] right-[-120px] [background:radial-gradient(circle,#4fa8ff_0%,transparent_70%)] [animation-delay:0s]" />
      <div className="blob absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-35 bottom-[-100px] left-[-120px] [background:radial-gradient(circle,#7c6cf8_0%,transparent_70%)] [animation-delay:2.5s]" />
      <div className="blob absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-35 top-[40%] right-[55%] [background:radial-gradient(circle,#a78bfa_0%,transparent_70%)] [animation-delay:5s]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white/[0.04] border border-white/[0.09] rounded-3xl p-10 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center p-2 text-white [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#e8eaf6] tracking-tight">Prisma</span>
        </div>

        <h1 className="text-[1.7rem] font-bold text-[#e8eaf6] tracking-tight mb-1.5">Welcome back</h1>
        <p className="text-[0.92rem] text-[#7c83a0] mb-7">Sign in to your account to continue</p>

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-5 text-sm font-medium bg-red-500/[0.12] border border-red-500/40 text-red-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[0.84rem] font-semibold text-[#e8eaf6] tracking-wide">Email address</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3.5 w-[18px] h-[18px] text-[#7c83a0] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
              </span>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="john@example.com" value={form.email} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[0.84rem] font-semibold text-[#e8eaf6] tracking-wide">Password</label>
              <Link href="#" className="text-xs text-[#4fa8ff] font-medium hover:text-[#7dd3fc] transition-colors">Forgot password?</Link>
            </div>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3.5 w-[18px] h-[18px] text-[#7c83a0] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              </span>
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Enter your password" value={form.password} onChange={handleChange} className={inputCls} />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#7c83a0] hover:text-[#e8eaf6] transition-colors p-0 [&>svg]:w-full [&>svg]:h-full">
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button id="signin-submit" type="submit" disabled={isPending}
            className="mt-1 flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-white text-[0.95rem] font-semibold tracking-wide cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px hover:opacity-90 hover:shadow-[0_8px_28px_rgba(124,108,248,0.5)] shadow-[0_4px_20px_rgba(124,108,248,0.35)] [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)] border-none">
            {isPending ? <><span className="spinner" />Signing in…</> : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-6">
          <span className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-xs text-[#7c83a0]">or</span>
          <span className="flex-1 h-px bg-white/[0.07]" />
        </div>

        <p className="text-center text-sm text-[#7c83a0] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/auth/SignUp" className="text-[#4fa8ff] font-semibold hover:text-[#7dd3fc] hover:underline transition-colors">Create one</Link>
        </p>
      </div>
    </main>
  );
}

const inputCls = "w-full bg-white/[0.06] border border-white/[0.09] rounded-[10px] py-3 pl-[42px] pr-3.5 text-[#e8eaf6] text-[0.9rem] outline-none placeholder:text-[#7c83a0] hover:bg-white/10 focus:border-[#7c6cf8] focus:shadow-[0_0_0_3px_rgba(124,108,248,0.2)] transition-all";
