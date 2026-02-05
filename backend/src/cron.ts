import { deleteReservation, getAllReservationsOnDate } from './reservation';
import { attemptReserve } from './reserve';
import { ExistingReservation } from './types/types';
import { timeOptions } from './utils/time.util';
import { CronJob } from 'cron';
import { Pool } from 'pg';

export function startCron(pool: Pool) {
  const job = CronJob.from({
    cronTime: '10 0 6 * * *',
    onTick: () => runJobs(pool),
    timeZone: 'America/Chicago',
  });
  console.log('Starting cron job to make reservations');
  job.start();
}

async function runJobs(pool: Pool) {
  console.log('Running cron job to make reservations');
  const jobs = await getJobs(pool);

  if (jobs.length === 0) {
    console.log('No reservations to make today');
    return;
  }

  console.log(`Found ${jobs.length} reservations to make today`);
  for (const job of jobs) {
    console.log(
      `Attempting reservation for ${job.username} on ${job.date.month + 1}/${job.date.day}/${job.date.year} from ${timeOptions[job.startTimeIdx]} to ${timeOptions[job.endTimeIdx]}`,
    );

    try {
      await attemptReserve(job);
      console.log(`Successfully made reservation for ${job.username}`);
    } catch (error) {
      console.error(
        `Failed to make reservation for ${job.username}: ${(error as Error).message}`,
      );
    } finally {
      await deleteReservation(pool, job.id);
      console.log(`Removed reservation for ${job.username} from database`);
    }
  }
}

async function getJobs(pool: Pool): Promise<ExistingReservation[]> {
  const date = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
  );
  date.setDate(date.getDate() + 2); // Reservations are made 2 days in advance

  const reservations = await getAllReservationsOnDate(pool, {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  });

  return reservations;
}
