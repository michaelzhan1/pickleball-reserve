import {
  ErrorResponse,
  ScheduleRequest,
  MakeScheduleResponse,
  GetAllScheduledReservationsResponse,
} from '@/types/api.type';

export async function getAllScheduledReservations(): Promise<
  GetAllScheduledReservationsResponse | ErrorResponse
> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
}

export async function scheduleReservation(
  body: ScheduleRequest,
): Promise<MakeScheduleResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
