import type { DateOption } from "@/types/datetime.type";

const numToDay: { [key: number]: string } = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const numToMonth: { [key: number]: string } = {
  0: 'January',
  1: 'Febuary',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
};

export function generateDateOptions(): DateOption[] {
  const date: Date = new Date();
  date.setDate(date.getDate() + 1); // TODO: CHANGE TO 3

  return Array.from({ length: 7 }).map(() => {
    const day = numToDay[date.getDay()];
    const month = numToMonth[date.getMonth()];
    const dateNumber = date.getDate();
    const year = date.getFullYear();
    const description = `${day}, ${month} ${dateNumber}`;
    date.setDate(date.getDate() + 1);
    return {
      label: description,
      value: {
        date: dateNumber,
        month: date.getMonth(),
        year: year,
      },
    };
  });
}

export function generateTimeOptions(): string[] {
  const times = [];
  let time = 8;
  let hourString: string;
  while (time <= 22) {
    hourString = `${(time - 1) % 12 + 1 < 10 ? '0' : ''}${(time - 1) % 12 + 1}`
    times.push(`${hourString}:00 ${time < 12 ? 'AM' : 'PM'}`);
    if (time !== 22) times.push(`${hourString}:30 ${time < 12 ? 'AM' : 'PM'}`);
    time++;
  }
  return times;
}
