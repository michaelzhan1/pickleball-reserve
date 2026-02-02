// this isn't used anywhere but is helpful for running playwright directly

import { ErrorResponse, PostReservationRequest, PostReservationResponse } from '@/types/api.type';

export async function attemptReserve(
  body: PostReservationRequest,
): Promise<PostReservationResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
