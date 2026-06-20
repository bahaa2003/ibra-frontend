import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import Loader from '../components/ui/Loader';
import { normalizeRole, ROLES } from '../utils/authRoles';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const products = useMediaStore((state) => state.products);
  const isLoading = useMediaStore((state) => state.isLoading);
  const loadProducts = useMediaStore((state) => state.loadProducts);

  const productLoadContext = normalizeRole(user?.role) === ROLES.SUPERVISOR ? 'storefront' : 'auto';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!products.length) {
      loadProducts({ context: productLoadContext });
    }
  }, [loadProducts, productLoadContext, products.length, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const product = products.find((item) => item.id === id);
    const next = new URLSearchParams();

    if (product) {
      if (product.category) {
        next.set('category', product.category);
      }
      next.set('request', product.id);
      navigate(`/products?${next.toString()}`, { replace: true });
      return;
    }

    navigate('/products', { replace: true });
  }, [id, isLoading, navigate, products, isAuthenticated]);

  return <Loader />;
};

export default ProductDetails;
