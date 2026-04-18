import { getSupabase } from '../auth/supabase';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return {};

  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
