"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Role = "USER" | "ADMIN";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: { id: string; name: string; email: string; role: Role; avatar: string | null };
  };
  token?: string;
  user?: { id: string; name: string; email: string; role: Role; avatar: string | null };
}

export default function SignUpPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "USER" as Role, avatar: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    startTransition(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, avatar: form.avatar || undefined }),
        });
        const resData: ApiResponse = await res.json();
        if (!resData.success) { setError(resData.message || "Registration failed."); return; }
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
      <div className="blob absolute w-[480px] h-[480px] rounded-full blur-[80px] opacity-35 top-[-120px] left-[-140px] [background:radial-gradient(circle,#7c6cf8_0%,transparent_70%)] [animation-delay:0s]" />
      <div className="blob absolute w-[380px] h-[380px] rounded-full blur-[80px] opacity-35 bottom-[-80px] right-[-100px] [background:radial-gradient(circle,#4fa8ff_0%,transparent_70%)] [animation-delay:3s]" />
      <div className="blob absolute w-[280px] h-[280px] rounded-full blur-[80px] opacity-35 top-1/2 left-[60%] [background:radial-gradient(circle,#a78bfa_0%,transparent_70%)] [animation-delay:5s]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-white/[0.04] border border-white/[0.09] rounded-3xl p-10 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center p-2 text-white [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#e8eaf6] tracking-tight">Prisma</span>
        </div>

        <h1 className="text-[1.65rem] font-bold text-[#e8eaf6] tracking-tight mb-1.5">Create your account</h1>
        <p className="text-[0.92rem] text-[#7c83a0] mb-7">Join us today — it&apos;s free</p>

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-5 text-sm font-medium bg-red-500/[0.12] border border-red-500/40 text-red-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Full Name */}
          <Field label="Full Name">
            <InputIcon><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></InputIcon>
            <input id="name" name="name" type="text" autoComplete="name" required placeholder="John Doe" value={form.name} onChange={handleChange} className={inputCls} />
          </Field>

          {/* Email */}
          <Field label="Email address">
            <InputIcon><svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></InputIcon>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="john@example.com" value={form.email} onChange={handleChange} className={inputCls} />
          </Field>

          {/* Role */}
          <Field label="Role">
            <InputIcon><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg></InputIcon>
            <select id="role" name="role" value={form.role} onChange={handleChange} className={`${inputCls} cursor-pointer pr-9 appearance-none`}>
              <option value="USER" className="bg-[#1a1d2e]">User</option>
              <option value="ADMIN" className="bg-[#1a1d2e]">Admin</option>
            </select>
            {/* caret */}
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#7c83a0]" />
          </Field>

          {/* Avatar */}
          <Field label={<>Avatar URL <span className="font-normal text-[#7c83a0] text-xs">(optional)</span></>}>
            <InputIcon><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg></InputIcon>
            <input id="avatar" name="avatar" type="url" placeholder="https://example.com/avatar.png" value={form.avatar} onChange={handleChange} className={inputCls} />
          </Field>

          {/* Password */}
          <Field label="Password">
            <InputIcon><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></InputIcon>
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required placeholder="Min. 8 characters" value={form.password} onChange={handleChange} className={inputCls} />
            <EyeBtn show={showPassword} onToggle={() => setShowPassword(p => !p)} />
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password">
            <InputIcon><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></InputIcon>
            <input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" required placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} className={inputCls} />
            <EyeBtn show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
          </Field>

          <button id="signup-submit" type="submit" disabled={isPending}
            className="mt-1 flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-white text-[0.95rem] font-semibold tracking-wide cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px hover:opacity-90 hover:shadow-[0_8px_28px_rgba(124,108,248,0.5)] shadow-[0_4px_20px_rgba(124,108,248,0.35)] [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)] border-none">
            {isPending ? <><span className="spinner" />Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#7c83a0] mt-6">
          Already have an account?{" "}
          <Link href="/auth/SignIn" className="text-[#4fa8ff] font-semibold hover:text-[#7dd3fc] hover:underline transition-colors">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

/* ── Shared helpers ── */
const inputCls = "w-full bg-white/[0.06] border border-white/[0.09] rounded-[10px] py-[11px] pl-[42px] pr-3.5 text-[#e8eaf6] text-[0.9rem] outline-none placeholder:text-[#7c83a0] hover:bg-white/10 focus:border-[#7c6cf8] focus:shadow-[0_0_0_3px_rgba(124,108,248,0.2)] transition-all";

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.84rem] font-semibold text-[#e8eaf6] tracking-wide">{label}</label>
      <div className="relative flex items-center">{children}</div>
    </div>
  );
}

function InputIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 w-[18px] h-[18px] text-[#7c83a0] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
      {children}
    </span>
  );
}

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-label="Toggle visibility" onClick={onToggle}
      className="absolute right-3 w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#7c83a0] hover:text-[#e8eaf6] transition-colors p-0 [&>svg]:w-full [&>svg]:h-full">
      {show ? (
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
      )}
    </button>
  );
}
