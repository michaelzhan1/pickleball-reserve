import { ReserveInfo, ReserveInfoDB } from '../types/types';
import 'dotenv/config';
import { Pool } from 'pg';

export async function getPool(): Promise<Pool> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function storeReservation(
  pool: Pool,
  {
    username,
    password,
    date: { dayString, date, month, year },
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  }: ReserveInfo,
): Promise<void> {
  await pool.query(
    `
INSERT INTO reservation (username, password, day_string, date, month, year, start_time_idx, end_time_idx, court_order)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      username,
      password,
      dayString,
      date,
      month,
      year,
      startTimeIdx,
      endTimeIdx,
      courtOrder,
    ],
  );
}

export async function retrieveAllReservations(
  pool: Pool,
): Promise<ReserveInfoDB[]> {
  const res = await pool.query<ReserveInfoDB>(
    `
SELECT id, username, password, day_string, date, month, year, start_time_idx, end_time_idx, court_order
FROM reservation`,
  );
  return res.rows;
}

export async function retrieveAllReservationsOnDay() {}
