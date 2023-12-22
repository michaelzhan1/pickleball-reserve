// Maps between days and months and indices
export const numToDay: {[key: number]: string} = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}

export const numToMonth: {[key: number]: string} = {
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
  11: 'December'
}

export const monthToNum: {[key: string]: number} = {
  'January': 0,
  'Febuary': 1,
  'March': 2,
  'April': 3,
  'May': 4,
  'June': 5,
  'July': 6,
  'August': 7,
  'September': 8,
  'October': 9,
  'November': 10,
  'December': 11
}

// functions
export function generateDateOptions(): string[] {
  const dates: string[] = [];
  const curDate: Date = new Date();
  curDate.setDate(curDate.getDate() + 3);
  
  let day: string;
  let month: string;
  let dateNumber: number;
  let year: number;
  for (let i = 0; i < 7; i++) {
    day = numToDay[curDate.getDay()];
    month = numToMonth[curDate.getMonth()];
    dateNumber = curDate.getDate();
    year = curDate.getFullYear();
    dates.push(`${day}, ${month} ${dateNumber}, ${year}`);
    curDate.setDate(curDate.getDate() + 1);
  }
  return dates;
}

export function generateTimeOptions(): string[] {
  const times = [];
  let time = 8;
  while (time <= 22) {
    times.push(`${(time - 1) % 12 + 1}:00 ${time < 12 ? 'AM' : 'PM'}`);
    if (time !== 22) times.push(`${(time - 1) % 12 + 1}:30 ${time < 12 ? 'AM' : 'PM'}`);
    time++;
  }
  return times;
}