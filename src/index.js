/* eslint-disable import/first */
if (!Object.hasOwn) { Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop); }

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);