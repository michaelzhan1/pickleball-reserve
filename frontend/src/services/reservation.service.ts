import {
  DeleteReservationResponse,
  ErrorResponse,
  GetReservationsResponse,
  PostReservationRequest,
  PostReservationResponse
} from '@/types/api.type';

export async function getAllReservations(): Promise<
  GetReservationsResponse | ErrorResponse
> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/reservations`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
}

export async function addReservation(
  body: PostReservationRequest,
): Promise<PostReservationResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

export async function deleteReservation(
  id: number,
): Promise<DeleteReservationResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/reservations`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).then((res) => res.json());
}
