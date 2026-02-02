import { ExistingReservation, NewReservation } from './types/types';
import { Pool } from 'pg';

// return reservation informations
export async function getAllReservations(pool: Pool) {
  const rows = await pool.query<ExistingReservation>(
    `
SELECT id, username, password, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order
FROM reservation`,
  );
  return rows.rows;
}

// return single reservation
export async function getReservation(
  pool: Pool,
  id: number,
): Promise<ExistingReservation | null> {
  const rows = await pool.query<ExistingReservation>(
    `
SELECT id, username, password, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order
FROM reservation
WHERE id=$1`,
    [id],
  );

  if (rows.rows.length === 0) {
    return null;
  }

  return rows.rows[0];
}

// add a reservation and create a job if it doesn't exist
export async function addReservation(
  pool: Pool,
  {
    username,
    password,
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
INSERT INTO reservation (username, password, day_of_week, day, month, year, start_time_idx, end_time_idx, court_order)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      username,
      password,
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
