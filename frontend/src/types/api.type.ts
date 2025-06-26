import { DateParts } from "@/types/datetime.type";

// request types
export interface ReserveRequest {
  username: string;
  password: string;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}

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

export interface ReserveResponse {
  success: boolean;
}

export interface AuthResponse {
  success: boolean;
}
