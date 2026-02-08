export interface DateParts {
  dayOfWeek: string;
  day: number;
  month: number;
  year: number;
}

export interface NewReservation {
  username: string;
  encPassData: EncPassData;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}

export interface ExistingReservation extends NewReservation {
  id: number;
}

export interface ReservationDBRow {
  id: number;
  username: string;
  enc_password: string;
  iv: string;
  auth_tag: string;
  day_of_week: string;
  day: number;
  month: number;
  year: number;
  start_time_idx: number;
  end_time_idx: number;
  court_order: string;
}

export interface PlaywrightResult {
  success: boolean;
  errorMessage: string;
}

export interface EncPassData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export interface CacheItem {
  expiry: Date;
  data: EncPassData;
}