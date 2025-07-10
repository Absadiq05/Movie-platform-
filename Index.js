// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import App from './App';
// Optional: If you use a UI framework like Material-UI, set up its theme here
// import { ThemeProvider, createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   // Define your theme palette, typography, etc.
// });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <ThemeProvider theme={theme}> */}
      <App />
    {/* </ThemeProvider> */}
  </React.StrictMode>
);
  
