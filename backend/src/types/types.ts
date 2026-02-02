export interface DateParts {
  dayOfWeek: string;
  day: number;
  month: number;
  year: number;
}

export interface NewReservation {
  username: string;
  password: string;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}

export interface ExistingReservation extends NewReservation {
  id: number;
}

export interface PlaywrightResult {
  success: boolean;
  errorMessage: string;
}