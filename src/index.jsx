import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Mount the React app to the DOM root element with StrictMode enabled
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report web vitals — deferred off the critical path
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => reportWebVitals());
} else {
  setTimeout(reportWebVitals, 1000);
}
