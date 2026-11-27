
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Header và các trang giao diện
import Header from './components/Header.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';

import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </div>
    </div>
  );
}
