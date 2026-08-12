const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { headers, ...restOptions } = options || {};
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string> ?? {}),
    },
    ...restOptions,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export function getAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
