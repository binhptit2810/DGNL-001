import React from "react";
const categoryNames = {
  keyboard: 'Bàn phím',
  mouse: 'Chuột',
  monitor: 'Màn hình',
  desk: 'Bàn làm việc',
  chair: 'Ghế văn phòng',
};
export default function ProductRow({ product, onEdit, onDelete }) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(product.price) + ' ₫';
  return (
    <tr data-testid="product-row">
      <td>{product.name}</td>
      <td>{product.sku}</td>
      <td>{categoryNames[product.category] || product.category}</td>
      <td>{formattedPrice}</td>
      <td>{product.stock === 0 ? (<span style={{ color: 'red', fontWeight: 'bold' }}>Hết hàng</span>) : (product.stock)}</td>
      <td>
        <span
          data-testid="product-status"
          className={`badge ${product.status === 'active' ? 'badge-green' : 'badge-gray'}`}
        >
          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td>
        <button data-testid="edit-button" onClick={() => onEdit(product)}>Sửa</button>
        <button data-testid="delete-button" onClick={() => onDelete(product)}>Xoá</button>
      </td>
    </tr>
  );
}