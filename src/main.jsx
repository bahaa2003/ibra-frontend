import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

// ============================================
// تنظيف البيانات القديمة من localStorage
// ============================================
function cleanupOldData() {
  try {
    const stored = localStorage.getItem('products-storage');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.state && data.state.products) {
        // تحقق من أن أول منتج يحتوي على الحقول الجديدة
        const firstProduct = data.state.products[0];
        if (firstProduct && !firstProduct.minimumOrderQty) {
          // البيانات قديمة - امسح كل شيء
          console.log('🧹 Cleaning old product data...');
          localStorage.removeItem('products-storage');
          return true; // تم المسح
        }
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
  return false;
}

// تنظيف عند البدء
if (cleanupOldData()) {
  console.log('✅ Old data cleaned. Refresh will load fresh data.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
