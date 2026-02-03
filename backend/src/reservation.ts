import {
  ExistingReservation,
  NewReservation,
  ReservationDBRow,
} from './types/types';
import { Pool } from 'pg';

function mapRowToReservation(row: ReservationDBRow): ExistingReservation {
  return {
    id: row.id,
    username: row.username,
    encPassData: {
      ciphertext: row.enc_password,
      iv: row.iv,
      authTag: row.auth_tag,
    },
    date: {
      dayOfWeek: row.day_of_week,
      day: row.day,
      month: row.month,
      year: row.year,
    },
    startTimeIdx: row.start_time_idx,
    endTimeIdx: row.end_time_idx,
    courtOrder: row.court_order,
  };
}

// return reservation informations
export async function getAllReservations(
  pool: Pool,
): Promise<ExistingReservation[]> {
  const rows = await pool.query<ReservationDBRow>(
    `
SELECT id, username, enc_password, iv, auth_tag, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order
FROM reservation`,
  );
  return rows.rows.map(mapRowToReservation);
}

// return single reservation
export async function getReservation(
  pool: Pool,
  id: number,
): Promise<ExistingReservation | null> {
  const rows = await pool.query<ReservationDBRow>(
    `
SELECT id, username, enc_password, iv, auth_tag, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order
FROM reservation
WHERE id=$1`,
    [id],
  );

  if (rows.rows.length === 0) {
    return null;
  }

  return mapRowToReservation(rows.rows[0]);
}

// return all on date
export async function getAllReservationsOnDate(pool: Pool, date: {
  day: number;
  month: number;
  year: number;
}): Promise<ExistingReservation[]> {
  console.log(date)
  const rows = await pool.query<ReservationDBRow>(
    `
SELECT id, username, enc_password, iv, auth_tag, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order
FROM reservation
WHERE day=$1 AND month=$2 AND year=$3`,
    [date.day, date.month, date.year],
  );

  return rows.rows.map(mapRowToReservation);
}

// add a reservation and create a job if it doesn't exist
export async function addReservation(
  pool: Pool,
  {
    username,
    encPassData,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  }: NewReservation,
): Promise<boolean> {
  // check for existing
  const rows = await pool.query(
    `
SELECT COUNT(*) FROM reservation
WHERE username=$1 AND day=$2 AND month=$3 AND year=$4`,
    [username, date.day, date.month, date.year],
  );

  if (parseInt(rows.rows[0].count, 10) > 0) {
    return false;
  }

  // insert new reservation
  await pool.query(
    `
INSERT INTO reservation (username, enc_password, iv, auth_tag, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      username,
      encPassData.ciphertext,
      encPassData.iv,
      encPassData.authTag,
      date.dayOfWeek,
      date.day,
      date.month,
      date.year,
      startTimeIdx,
      endTimeIdx,
      courtOrder,
    ],
  );

  return true;
}

export async function deleteReservation(
  pool: Pool,
  id: number,
): Promise<boolean> {
  const rows = await pool.query(
    `DELETE FROM reservation WHERE id=$1 RETURNING *`,
    [id],
  );

  if (rows.rowCount === 0) {
    return false;
  }

  return true;
}
