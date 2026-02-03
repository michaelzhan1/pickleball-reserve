export interface DateOption {
  label: string;
  value: DateParts;
}

export interface DateParts {
  dayOfWeek: string;
  day: number;
  month: number;
  year: number;
}
