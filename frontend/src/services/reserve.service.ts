import { ErrorResponse, ScheduleRequest, MakeScheduleResponse } from '@/types/api.type';

export async function attemptReserve(
  body: ScheduleRequest,
): Promise<MakeScheduleResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
