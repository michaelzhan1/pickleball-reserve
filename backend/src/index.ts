import { authCheck } from './auth';
import { getOrder, setOrder } from './courtOrder';
import { attemptLogin } from './loginCheck';
import {
  addReservation,
  deleteReservation,
  getAllReservations,
} from './schedule';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

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

app.get('/courtOrder', (_req, res) => {
  res.json({
    order: getOrder(),
  });
});

app.put('/courtOrder', (req, res) => {
  const { order } = req.body;
  try {
    if (!order) {
      res.status(400).json({ error: 'Order is required' });
      return;
    }
    setOrder(order);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
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

app.get('/schedule', async (_req, res) => {
  res.json({ reservations: getAllReservations() });
});

app.post('/schedule', async (req, res) => {
  const { username, password, date, startTimeIdx, endTimeIdx, courtOrder } =
    req.body;
  console.log('Scheduling reservation...');
  const result = addReservation({
    username,
    password,
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

app.delete('/schedule', (req, res) => {
  const { username, date } = req.body;
  console.log(`Deleting reservation for ${username} on ${date}`);
  const result = deleteReservation(username, date);
  if (result) {
    console.log('Reservation deleted successfully');
    res.json({ success: true });
  } else {
    console.error('Failed to delete reservation: No reservation found');
    res
      .status(404)
      .json({ error: 'No reservation found for this user on this date' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
