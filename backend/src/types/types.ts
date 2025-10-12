export interface DateParts {
  dayString: string;
  date: number;
  month: number;
  year: number;
}

export interface ReserveInfo {
  username: string;
  password: string;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}

export interface ReserveInfoDB extends ReserveInfo {
  id: number;
}

export interface PlaywrightResult {
  success: boolean;
  errorMessage: string;
}