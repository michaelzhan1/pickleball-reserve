import { DateParts } from '@/types/datetime.type';
import { ReserveInfo } from '@/types/reserve.type';

// request types
export type PostScheduleRequest = ReserveInfo;

export type DeleteScheduleRequest = {
  username: string;
  date: DateParts;
};

// response types
export interface ErrorResponse {
  error: string;
}

export interface GetCourtOrderResponse {
  order: string;
}

export interface PutCourtOrderResponse {
  success: boolean;
}

export interface LoginCheckResponse {
  success: boolean;
}

export interface GetScheduleResponse {
  reservations: ReserveInfo[];
}

export interface PostScheduleResponse {
  success: boolean;
}

export interface DeleteScheduleReponse {
  success: boolean;
}

export interface AuthResponse {
  success: boolean;
}
