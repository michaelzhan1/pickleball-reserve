import { attemptReserve } from './reserve';
import { DateParts, ReserveInfo } from './types/types';
import { retrieveAllReservations, storeReservation } from './utils/database.util';
import { CronJob } from 'cron';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const reservationMap = new Map<string, ReserveInfo[]>(); // job id -> {username, password, date, startTimeIdx, endTimeIdx, courtOrder}[]
const jobIdMap = new Map<string, string>(); // date string -> job id

// return reservation informations
export async function getAllReservations(client: Client) {
  return retrieveAllReservations(client);
}

// add a reservation and create a job if it doesn't exist
export async function addReservation(
  client: Client,
  {
    username,
    password,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  }: ReserveInfo,
): Promise<boolean> {
  await storeReservation(client, {
    username,
    password,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  });

  const dateString = `${date.year}-${date.month + 1}-${date.date}`;
  const reservation = {
    username,
    password,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  };

  let jobId = jobIdMap.get(dateString)!;

  // If a job ID for this date doesn't exist, create a new one
  if (!jobId) {
    jobId = uuidv4();
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
      } of reservationMap.get(jobId)!) {
        try {
          await attemptReserve({
            username,
            password,
            date,
            startTimeIdx,
            endTimeIdx,
            courtOrder,
          });
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

  const existingReservation = reservationMap
    .get(jobId)!
    .find(
      (res) =>
        res.username === username &&
        res.date.year === date.year &&
        res.date.month === date.month &&
        res.date.date === date.date,
    );
  if (existingReservation) {
    return false; // Reservation already exists for this user on this date
  }

  reservationMap.get(jobId)!.push(reservation);

  console.log(
    `Added reservation for ${username} on ${dateString} at times ${startTimeIdx}-${endTimeIdx} for courts ${courtOrder}.`,
  );
  return true;
}

export function deleteReservation(username: string, date: DateParts) {
  const dateString = `${date.year}-${date.month + 1}-${date.date}`;
  const jobId = jobIdMap.get(dateString);
  if (!jobId) {
    console.error(`No job found for date ${dateString}`);
    return false;
  }

  const reservations = reservationMap.get(jobId);
  if (!reservations) {
    console.error(`No reservations found for job ID ${jobId}`);
    return false;
  }

  const index = reservations.findIndex(
    (res) =>
      res.username === username &&
      res.date.year === date.year &&
      res.date.month === date.month &&
      res.date.date === date.date,
  );

  if (index === -1) {
    console.error(`No reservation found for user ${username} on ${dateString}`);
    return false;
  }

  reservations.splice(index, 1);
  console.log(`Deleted reservation for ${username} on ${dateString}.`);
  return true;
}
