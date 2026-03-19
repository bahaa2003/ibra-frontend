import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { devLogger } from './utils/devLogger';

function cleanupOldData() {
  try {
    const stored = localStorage.getItem('products-storage');
    if (!stored) return false;

    const data = JSON.parse(stored);
    const firstProduct = data?.state?.products?.[0];

    if (firstProduct && !firstProduct.minimumOrderQty) {
      localStorage.removeItem('products-storage');
      return true;
    }
  } catch (error) {
    devLogger.error('Cleanup error:', error);
  }

  return false;
}

cleanupOldData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
