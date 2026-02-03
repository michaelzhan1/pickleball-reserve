import { authCheck } from './auth';
import { attemptLogin } from './loginCheck';
import {
  addReservation,
  deleteReservation,
  getAllReservations,
  getReservation,
} from './reservation';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import { checkValidOrder } from './utils/courtOrder.util';
import { encrypt } from './utils/crypto.util';
import { startCron } from './cron';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

startCron(pool);

const app = express();
const port = 3000;
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all origins by default
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/auth', (req, res) => {
  const { password } = req.body;
  if (authCheck(password)) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

app.post('/loginCheck', async (req, res) => {
  console.log('Checking login credentials...');
  const { username, password } = req.body;
  attemptLogin(username, password).then(({ success, errorMessage }) => {
    if (success) {
      console.log('Login successful');
      res.json({ success });
    } else {
      console.error('Login failed:', errorMessage);
      res.status(401).json({ error: errorMessage });
    }
  });
});

app.get('/reservations', async (_req, res) => {
  res.json({ reservations: await getAllReservations(pool) });
});

app.post('/reservations', async (req, res) => {
  const { username, password, date, startTimeIdx, endTimeIdx, courtOrder } =
    req.body;

  if (!checkValidOrder(courtOrder)) {
    console.error('Invalid court order format:', courtOrder);
    res.status(400).json({ error: 'Invalid court order format' });
    return;
  }

  const encPassData = encrypt(password);

  console.log('Scheduling reservation...');
  const result = await addReservation(pool, {
    username,
    encPassData,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder,
  });
  if (result) {
    console.log('Reservation scheduled successfully');
    res.json({ success: true });
  } else {
    console.error('Failed to schedule reservation: Reservation already exists');
    res
      .status(400)
      .json({ error: 'Reservation already scheduled on this day' });
  }
});

app.delete('/reservations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid reservation ID' });
    return;
  }

  const row = await getReservation(pool, id);
  if (row === null) {
    res.status(404).json({ error: 'Reservation not found' });
    return;
  }

  console.log(`Deleting reservation with id ${id}`);
  const result = await deleteReservation(pool, id);
  if (result) {
    console.log('Reservation deleted successfully');
    res.json({ success: true });
  } else {
    console.error('Failed to delete reservation');
    res
      .status(500)
      .json({ error: 'Failed to delete reservation' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
