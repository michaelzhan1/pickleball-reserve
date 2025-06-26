import { attemptReserve } from './reserve.js';
import { CronJob } from 'cron';

const reservationMap = new Map(); // job id -> {username, password, date, startTimeIdx, endTimeIdx, courtOrder}[]
const jobIdMap = new Map(); // date string -> job id

// return reservation informations
export function getAllReservations() {
  return Array.from(reservationMap.values()).flat();
}

// add a reservation and create a job if it doesn't exist
export function addReservation(
  username,
  password,
  date,
  startTimeIdx,
  endTimeIdx,
  courtOrder,
) {
  const dateString = `${date.year}-${date.month + 1}-${date.date}`;
  const reservation = {
    username,
    password,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  };

  let jobId = jobIdMap.get(dateString);

  // If a job ID for this date doesn't exist, create a new one
  if (!jobId) {
    jobId = crypto.randomUUID();
    jobIdMap.set(dateString, jobId);
    reservationMap.set(jobId, []);

    const targetDate = new Date(date.year, date.month, date.date - 2);
    const cronPattern = `10 0 6 ${targetDate.getDate()} ${targetDate.getMonth() + 1} *`;
    const wrapper = async () => {
      console.log(`Running job for ${dateString} with ID ${jobId}`);
      for (const {
        username,
        password,
        date,
        startTimeIdx,
        endTimeIdx,
        courtOrder,
      } of reservationMap.get(jobId)) {
        try {
          await attemptReserve(
            username,
            password,
            date,
            startTimeIdx,
            endTimeIdx,
            courtOrder,
          );
        } catch (error) {
          console.error(
            `Error during reservation attempt for ${username} on ${dateString}:`,
            error,
          );
        }
      }
      job.stop();
      reservationMap.delete(jobId);
      jobIdMap.delete(dateString);
      console.log(`Jobs for ${dateString} completed and removed.`);
    };
    const job = new CronJob(
      cronPattern,
      wrapper,
      null,
      true,
      'America/Chicago',
    );
    job.start();
  }
  reservationMap.get(jobId).push(reservation);

  console.log(
    `Added reservation for ${username} on ${dateString} at times ${startTimeIdx}-${endTimeIdx} for courts ${courtOrder}.`,
  );
  return jobId;
}
