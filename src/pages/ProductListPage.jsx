import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient.js';
import ProductTable from '../components/ProductTable.jsx';
import { useNavigate } from 'react-router-dom';

export default function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products?page=1&limit=10');
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main>
      <header>OfficeMart Admin</header>
      <h1>Sản phẩm</h1>
            <button data-testid="add-button" onClick={() => navigate('/products/new')}>
        Thêm sản phẩm
      </button>

      {loading && <div data-testid="loading">Đang tải danh sách...</div>}

      {!loading && error && (
        <div data-testid="error-message">
          <p>{error}</p>
          <button data-testid="retry-button" onClick={fetchProducts}>Thử lại</button>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div data-testid="empty-state">Không có sản phẩm nào</div>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductTable products={products} />
      )}
    </main>
  );
}