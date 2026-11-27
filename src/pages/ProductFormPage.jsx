import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: '', stock: '', status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const validate = () => {
    const err = {};
    const nameTrim = formData.name.trim();
    if (nameTrim.length < 3 || nameTrim.length > 100) err.name = 'Tên từ 3-100 ký tự';
    
    if (!/^[A-Z]{3}-\d{4}$/.test(formData.sku.trim())) err.sku = 'SKU dạng ABC-1234';
    
    if (!formData.category) err.category = 'Bắt buộc chọn danh mục';
    if (!formData.price || Number(formData.price) <= 0) err.price = 'Giá phải lớn hơn 0';
    if (formData.stock === '' || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
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

    setIsSubmitting(true);
    try {
      await api.post('/products', {
        ...formData,
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
      });
      navigate('/products');
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ sku: err.response.data?.message || 'SKU đã tồn tại' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form data-testid="product-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Tên sản phẩm</label>
        <input id="name" name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p data-testid="field-error-name">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="sku">SKU</label>
        <input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
        {errors.sku && <p data-testid="field-error-sku">{errors.sku}</p>}
      </div>

      <div>
        <label htmlFor="category">Danh mục</label>
        <select id="category" name="category" value={formData.category} onChange={handleChange}>
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.category && <p data-testid="field-error-category">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="price">Giá</label>
        <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
        {errors.price && <p data-testid="field-error-price">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="stock">Tồn kho</label>
        <input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
        {errors.stock && <p data-testid="field-error-stock">{errors.stock}</p>}
      </div>

      <button type="submit" data-testid="submit-button" disabled={isSubmitting}>Lưu</button>
    </form>
  );
}