import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Loader from '../components/ui/Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }

    const productId = String(id || '').trim();
    navigate(
      productId ? `/products?request=${encodeURIComponent(productId)}` : '/products',
      { replace: true }
    );
  }, [id, isAuthenticated, navigate]);

  return <Loader />;
};

export default ProductDetails;
