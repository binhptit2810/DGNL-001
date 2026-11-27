import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get('/categories')
      .then((res) => {
        if (isMounted) setCategories(res.data);
      })
      .catch((err) => {
        console.error('Lỗi tải danh mục:', err);
      });

    if (isEdit) {
      setIsLoading(true);
      api.get(`/products/${id}`)
        .then((res) => {
          if (!isMounted) return;
          const p = res.data;
          setFormData({
            name: p.name || '',
            sku: p.sku || '',
            category: p.category || '',
            price: p.price !== undefined ? String(p.price) : '',
            stock: p.stock !== undefined ? String(p.stock) : '',
            status: p.status || 'active',
          });
        })
        .catch((err) => {
          if (!isMounted) return;
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setErrors({ general: err.response?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm' });
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const err = {};
    const nameTrim = formData.name.trim();
    if (!nameTrim || nameTrim.length < 3 || nameTrim.length > 100) {
      err.name = 'Tên sản phẩm bắt buộc, từ 3 đến 100 ký tự';
    }

    const skuTrim = formData.sku.trim();
    if (!skuTrim || !/^[A-Z]{3}-\d{4}$/.test(skuTrim)) {
      err.sku = 'SKU bắt buộc, đúng định dạng ABC-1234';
    }

    if (!formData.category) {
      err.category = 'Bắt buộc chọn danh mục';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
      err.price = 'Giá phải là số lớn hơn 0';
    }

    const stockNum = Number(formData.stock);
    if (formData.stock === '' || isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      err.stock = 'Tồn kho là số nguyên không âm';
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      status: formData.status || 'active',
    };

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        navigate('/products', { state: { toast: 'Đã cập nhật sản phẩm' } });
      } else {
        await api.post('/products', payload);
        navigate('/products', { state: { toast: 'Đã thêm sản phẩm' } });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          sku: err.response.data?.message || 'SKU đã tồn tại',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm',
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <main className="main-content">
        <div className="not-found-card">
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm có mã #{id} không tồn tại hoặc đã bị xoá.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/products')}
          >
            Quay về danh sách
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="main-content">
        <div data-testid="loading" className="loading-state">
          Đang tải thông tin sản phẩm...
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="form-card-container">
        <div className="page-header">
          <h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        </div>

        {errors.general && <div className="error-alert">{errors.general}</div>}

        <form data-testid="product-form" onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Tên sản phẩm</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm (3 - 100 ký tự)"
            />
            {errors.name && (
              <p data-testid="field-error-name" className="field-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="sku">SKU</label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Ví dụ: KEY-0001"
            />
            {errors.sku && (
              <p data-testid="field-error-sku" className="field-error">
                {errors.sku}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Danh mục</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p data-testid="field-error-category" className="field-error">
                {errors.category}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="price">Giá</label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Nhập giá (> 0)"
            />
            {errors.price && (
              <p data-testid="field-error-price" className="field-error">
                {errors.price}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="stock">Tồn kho</label>
            <input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Nhập số lượng tồn kho (>= 0)"
            />
            {errors.stock && (
              <p data-testid="field-error-stock" className="field-error">
                {errors.stock}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
            {errors.status && (
              <p data-testid="field-error-status" className="field-error">
                {errors.status}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              data-testid="submit-button"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/products')}
              disabled={isSubmitting}
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
