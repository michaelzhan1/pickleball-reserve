import { DateParts } from "@/types/datetime.type";

export interface ReserveInfo {
  username: string;
  password: string;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}

export interface ReserveResult