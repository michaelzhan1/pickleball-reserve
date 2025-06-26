import { ReserveInfo } from "@/types/reserve.type";

// request types
export type ScheduleRequest = ReserveInfo;

// response types
export interface ErrorResponse {
  error: string;
}

export interface CourtOrderResponse {
  order: string;
}

export interface LoginCheckResponse {
  success: boolean;
}

export interface GetAllScheduledReservationsResponse {
  reservations: ReserveInfo[];
}

export interface MakeScheduleResponse {
  success: boolean;
}

export interface AuthResponse {
  success: boolean;
}
