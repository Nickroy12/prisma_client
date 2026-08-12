import { cookies } from 'next/headers';
import { apiFetch, getAuthHeader } from '../../lib/api';
import { User, Role } from '../../types';

async function getMe(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return await apiFetch<User>('/api/auth/me', {
      headers: getAuthHeader(token),
    });
  } catch {
    return null;
  }
}

export default async function UserDashboard() {
  const user = await getMe();

  if (!user) {
    return (
      <div className="bg-[#16192b] border border-[#2a2e45] rounded-3xl p-8 text-center">
        <p className="text-[#7c83a0]">
          Not logged in. Please{' '}
          <a href="/auth/SignIn" className="text-indigo-400 underline">
            sign in
          </a>{' '}
          to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#16192b] border border-[#2a2e45] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-[#121422] flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-indigo-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {user.role === Role.ADMIN && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-[#121422] text-xs font-extrabold px-3 py-1 rounded-full border-2 border-[#16192b] shadow-lg">
              ADMIN
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold text-[#e8eaf6] tracking-tight">{user.name}</h2>
          <p className="text-[#7c83a0] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {user.email}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-[#1e2238] text-[#e8eaf6] border border-[#2a2e45]">
              Role: {user.role}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/20">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
