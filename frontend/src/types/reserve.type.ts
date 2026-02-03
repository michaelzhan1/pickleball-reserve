import { DateParts } from "@/types/datetime.type";

export interface ReservationListItem {
  id: number;
  username: string;
  password: string;
  date: DateParts;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}

export interface ReservationFormdata {
  username: string;
  password: string;
  dateIdx: number;
  startTimeIdx: number;
  endTimeIdx: number;
  courtOrder: string;
}
