import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api/axiosClient.js';

/**
 * Custom hook tải danh sách sản phẩm có huỷ request cũ bằng AbortController
 * và xử lý triệt để race condition khi mạng chậm / độ trễ bất đồng bộ.
 */
export default function useProductSearch(params) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefetchIndex((prev) => prev + 1);
  }, []);

  const q = (params?.q || '').trim();
  const category = params?.category || '';
  const status = params?.status || '';
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;

  useEffect(() => {
    const controller = new AbortController();
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {
          page,
          limit,
        };
        if (q) queryParams.q = q;
        if (category) queryParams.category = category;
        if (status) queryParams.status = status;

        const res = await api.get('/products', {
          params: queryParams,
          signal: controller.signal,
        });

        if (!isCancelled) {
          setData(res.data?.data || []);
          setTotal(res.data?.total || 0);
        }
      } catch (err) {
        // Nếu request bị huỷ bởi chính ta (AbortController), bỏ qua và không set error
        if (axios.isCancel(err) || err.name === 'CanceledError' || controller.signal.aborted) {
          return;
        }
        if (!isCancelled) {
          setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
        }
      } finally {
        if (!isCancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [q, category, status, page, limit, refetchIndex]);

  return { data, total, loading, error, refetch };
}
