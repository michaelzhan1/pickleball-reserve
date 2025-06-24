import App from '@/App.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import RobotoFont from '@/assets/fonts/Roboto-Regular.ttf';

const root = document.getElementById('root');
if (!root) throw new Error('Failed to load root element');

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Roboto';
    src: url(${RobotoFont}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }
`

createRoot(root).render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>,
);
