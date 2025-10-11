export function generateTimeOptions(): string[] {
  const times: string[] = [];
  let time: number = 8;
  let hourString: string;
  
  while (time <= 22) {
    hourString = `${((time - 1) % 12) + 1 < 10 ? '0' : ''}${((time - 1) % 12) + 1}`;
    times.push(`${hourString}:00 ${time < 12 ? 'AM' : 'PM'}`);
    if (time !== 22) times.push(`${hourString}:30 ${time < 12 ? 'AM' : 'PM'}`);
    time++;
  }
  return times;
}
