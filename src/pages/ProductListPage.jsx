import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ProductTable from '../components/ProductTable.jsx';
import useProductSearch from '../hooks/useProductSearch.js';
import { categoryNames as defaultCategoryNames } from '../data/sample.js';

export default function ProductListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parameters (single source of truth for queries)
  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlStatus = searchParams.get('status') || '';
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const urlPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Local state for search input (debounced 400ms)
  const [searchInput, setSearchInput] = useState(urlQ);

  // Categories list and name lookup
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState(defaultCategoryNames);

  // Dialog and feedback states
  const [toast, setToast] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Sync searchInput when URL q changes (e.g. Back/Forward browser navigation)
  useEffect(() => {
    setSearchInput(urlQ);
  }, [urlQ]);

  // Load categories from API on mount
  useEffect(() => {
    let isMounted = true;
    api.get('/categories')
      .then((res) => {
        if (!isMounted) return;
        setCategories(res.data || []);
        const map = { ...defaultCategoryNames };
        (res.data || []).forEach((c) => {
          map[c.id] = c.name;
        });
        setCategoryNames(map);
      })
      .catch((err) => {
        console.error('Lỗi tải danh mục:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for toast passed via navigation state (e.g. after Add/Edit)
  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-hide toast after 3.5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounce search input: only update URL (and thus call API) 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== urlQ.trim()) {
        const nextParams = {};
        if (trimmed) nextParams.q = trimmed;
        if (urlCategory) nextParams.category = urlCategory;
        if (urlStatus) nextParams.status = urlStatus;
        // Đổi từ khoá thì quay về trang 1
        nextParams.page = '1';
        setSearchParams(nextParams);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, urlQ, urlCategory, urlStatus, setSearchParams]);

  // Fetch products using the custom hook with AbortController
  const { data: products, total, loading, error, refetch } = useProductSearch({
    q: urlQ,
    category: urlCategory,
    status: urlStatus,
    page: urlPage,
    limit: 10,
  });

  const totalPages = Math.max(1, Math.ceil(total / 10));

  // Category filter change handler
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const nextParams = {};
    if (searchInput.trim()) nextParams.q = searchInput.trim();
    if (val) nextParams.category = val;
    if (urlStatus) nextParams.status = urlStatus;
    // Đổi bộ lọc thì quay về trang 1
    nextParams.page = '1';
    setSearchParams(nextParams);
  };

  // Status filter change handler
  const handleStatusChange = (e) => {
    const val = e.target.value;
    const nextParams = {};
    if (searchInput.trim()) nextParams.q = searchInput.trim();
    if (urlCategory) nextParams.category = urlCategory;
    if (val) nextParams.status = val;
    // Đổi bộ lọc thì quay về trang 1
    nextParams.page = '1';
    setSearchParams(nextParams);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (urlPage > 1) {
      const nextParams = {};
      if (urlQ.trim()) nextParams.q = urlQ.trim();
      if (urlCategory) nextParams.category = urlCategory;
      if (urlStatus) nextParams.status = urlStatus;
      nextParams.page = String(urlPage - 1);
      setSearchParams(nextParams);
    }
  };

  const handleNextPage = () => {
    if (urlPage < totalPages) {
      const nextParams = {};
      if (urlQ.trim()) nextParams.q = urlQ.trim();
      if (urlCategory) nextParams.category = urlCategory;
      if (urlStatus) nextParams.status = urlStatus;
      nextParams.page = String(urlPage + 1);
      setSearchParams(nextParams);
    }
  };

  // Actions
  const handleEdit = (product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDeleteClick = (product) => {
    setDeleteCandidate(product);
  };

  const handleConfirmCancel = () => {
    setDeleteCandidate(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.delete(`/products/${deleteCandidate.id}`);
      setDeleteCandidate(null);
      setToast('Đã xoá sản phẩm');
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xoá sản phẩm');
    }
  };

  return (
    <main className="main-content">
      {toast && (
        <div data-testid="toast" className="toast">
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          data-testid="add-button"
          className="btn-primary"
          onClick={() => navigate('/products/new')}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="filter-toolbar">
        <div className="search-field">
          <input
            data-testid="search-input"
            className="search-input"
            type="text"
            placeholder="Tìm kiếm theo tên hoặc SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="filter-fields">
          <select
            data-testid="category-filter"
            className="filter-select"
            value={urlCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            data-testid="status-filter"
            className="filter-select"
            value={urlStatus}
            onChange={handleStatusChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>
      </div>

      {/* Status states */}
      {loading && (
        <div data-testid="loading" className="loading-state">
          Đang tải danh sách...
        </div>
      )}

      {!loading && error && (
        <div data-testid="error-message" className="error-state">
          <p>{error}</p>
          <button
            type="button"
            data-testid="retry-button"
            className="btn-primary"
            onClick={refetch}
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div data-testid="empty-state" className="empty-state">
          Không có sản phẩm nào
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            categoryNames={categoryNames}
          />

          {/* Pagination */}
          <div data-testid="pagination" className="pagination">
            <button
              type="button"
              data-testid="page-prev"
              className="btn btn-outline"
              disabled={urlPage <= 1}
              onClick={handlePrevPage}
            >
              Trước
            </button>
            <span data-testid="page-current" className="page-current">
              {`${urlPage} / ${totalPages}`}
            </span>
            <button
              type="button"
              data-testid="page-next"
              className="btn btn-outline"
              disabled={urlPage >= totalPages}
              onClick={handleNextPage}
            >
              Sau
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="modal-backdrop">
          <div data-testid="confirm-dialog" className="confirm-dialog">
            <h3>Xác nhận xoá</h3>
            <p>
              Bạn có chắc chắn muốn xoá sản phẩm{' '}
              <strong>{deleteCandidate.name}</strong> không?
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                data-testid="confirm-no"
                className="btn btn-outline"
                onClick={handleConfirmCancel}
              >
                Huỷ
              </button>
              <button
                type="button"
                data-testid="confirm-yes"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
