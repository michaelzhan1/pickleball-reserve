import { AuthResponse, ErrorResponse } from '@/types/api.type';

export async function attemptAuth(
  password: string,
): Promise<AuthResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then((res) => res.json());
}
