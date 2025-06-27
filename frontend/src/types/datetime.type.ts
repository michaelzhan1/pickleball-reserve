export interface DateOption {
  label: string;
  value: DateParts;
}

export interface DateParts {
  dayString: string;
  date: number;
  month: number;
  year: number;
}
