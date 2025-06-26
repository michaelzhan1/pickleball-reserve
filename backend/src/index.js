import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { authCheck } from './auth.js';
import { getOrder, setOrder } from './courtOrder.js';
import { attemptLogin } from './loginCheck.js';
import { addReservation, getAllReservations } from './schedule.js';

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
})

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
  res.json({ reservations: getAllReservations()});
});

app.post('/schedule', async (req, res) => {
  const { username, password, date, startTimeIdx, endTimeIdx, courtOrder } = req.body;
  console.log('Scheduling reservation...');
  addReservation(
    username,
    password,
    date,
    startTimeIdx,
    endTimeIdx,
    courtOrder
  );
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
