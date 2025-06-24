import App from './App.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (!root) throw new Error('Failed to load root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
