import React from "react";

import ProductRow from "./ProductRow";

export default function ProductTable({products = [], onEdit, onDelete}){    return(
        <table data-testid="product-table" className="product-table" >
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>SKu</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {products.map((item)=>(
                    <ProductRow
                    key={item.id}
                    product={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    />
                ))}
            </tbody>
        </table>
    )
}