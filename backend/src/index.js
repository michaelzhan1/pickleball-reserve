import { getOrder, setOrder } from './courtOrder.js';
import { attemptLogin } from './loginCheck.js';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const port = 3000;
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all origins by default
};

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello World!');
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
    res.json({ order: getOrder() });
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
