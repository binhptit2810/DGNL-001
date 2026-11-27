import React from 'react';
import { categoryNames as defaultCategoryNames } from '../data/sample.js';

export default function ProductRow({ product, onEdit, onDelete, categoryNames = defaultCategoryNames }) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(product.price) + ' ₫';
  const categoryLabel = (categoryNames && categoryNames[product.category]) || product.category;

  return (
    <tr data-testid="product-row" className="product-row">
      <td data-label="Tên" className="cell-name">{product.name}</td>
      <td data-label="SKU" className="cell-sku">{product.sku}</td>
      <td data-label="Danh mục" className="cell-category">{categoryLabel}</td>
      <td data-label="Giá" className="cell-price">{formattedPrice}</td>
      <td data-label="Tồn kho" className="cell-stock">
        {product.stock === 0 ? (
          <span className="stock-empty" style={{ color: '#dc2626', fontWeight: 'bold' }}>Hết hàng</span>
        ) : (
          product.stock
        )}
      </td>
      <td data-label="Trạng thái" className="cell-status">
        <span
          data-testid="product-status"
          className={`badge ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}`}
        >
          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td data-label="Thao tác" className="cell-actions">
        <button
          type="button"
          data-testid="edit-button"
          className="btn btn-outline"
          onClick={() => onEdit && onEdit(product)}
        >
          Sửa
        </button>
        <button
          type="button"
          data-testid="delete-button"
          className="btn btn-outline-danger"
          onClick={() => onDelete && onDelete(product)}
        >
          Xoá
        </button>
      </td>
    </tr>
  );
}
