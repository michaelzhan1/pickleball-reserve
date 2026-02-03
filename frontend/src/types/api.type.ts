import { DateParts } from '@/types/datetime.type';
import { ReservationListItem } from '@/types/reserve.type';

// request types
export type PostReservationRequest = {
  username: string;
  password: string;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
};

// response types
export interface ErrorResponse {
  error: string;
}

export interface LoginCheckResponse {
  success: boolean;
}

export interface GetReservationsResponse {
  reservations: ReservationListItem[];
}

export interface PostReservationResponse {
  success: boolean;
}

export interface DeleteReservationResponse {
  success: boolean;
}

export interface AuthResponse {
  success: boolean;
}
