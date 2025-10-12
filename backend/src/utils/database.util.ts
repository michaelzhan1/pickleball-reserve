import { ReserveInfo, ReserveInfoDB } from '../types/types';
import 'dotenv/config';
import { Client } from 'pg';

export async function getClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

export async function storeReservation(
  client: Client,
  {
    username,
    password,
    date: { dayString, date, month, year },
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  }: ReserveInfo,
): Promise<void> {
  await client.query(
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
  client: Client,
): Promise<ReserveInfoDB[]> {
  const res = await client.query<ReserveInfoDB>(
    `
SELECT id, username, password, day_string, date, month, year, start_time_idx, end_time_idx, court_order
FROM reservation`,
  );
  return res.rows;
}

export async function retrieveAllReservationsOnDay() {}
