import { getOrder, setOrder } from './courtOrder.js';
import express from 'express';

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
