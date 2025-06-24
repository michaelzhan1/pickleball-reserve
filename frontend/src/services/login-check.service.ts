import { ErrorResponse, LoginCheckResponse } from '@/types/api.type';

export async function attemptLogin(
  username: string,
  password: string,
): Promise<LoginCheckResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/loginCheck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then((res) => res.json());
}
