import { CourtOrderResponse, ErrorResponse } from '@/types/api.type';

export async function getCourtOrder(): Promise<
  CourtOrderResponse | ErrorResponse
> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/courtOrder`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
}

export async function updateCourtOrder(
  courtOrder: string,
): Promise<CourtOrderResponse | ErrorResponse> {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/courtOrder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order: courtOrder }),
  }).then((res) => res.json());
}
