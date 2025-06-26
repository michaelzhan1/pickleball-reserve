import {
  ErrorResponse,
  ScheduleRequest,
  PostScheduleResponse,
  GetScheduleResponse,
} from '@/types/api.type';

export async function getAllScheduledReservations(): Promise<
  GetScheduleResponse | ErrorResponse
> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
}

export async function scheduleReservation(
  body: ScheduleRequest,
): Promise<PostScheduleResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
