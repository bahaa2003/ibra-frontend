import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, AlertCircle, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useMediaStore from '../store/useMediaStore';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import useAdminStore from '../store/useAdminStore';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { calculateProductPrice } from '../utils/pricing';
import { getProductStatus } from '../utils/productStatus';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('en') ? 'en' : 'ar';

  const { products } = useMediaStore();
  const { user, updateUserSession } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { updateUserCoins } = useAdminStore();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    const found = products.find((p) => p.id === id);
    if (found) setProduct(found);
    else navigate('/products');
  }, [id, products, navigate]);

  if (!product) return null;

  const price = calculateProductPrice(product, user?.group);
  const productName = language === 'ar' ? product.nameAr || product.name : product.name;
  const productDesc = language === 'ar' ? product.descriptionAr || product.description : product.description;
  const productState = getProductStatus(product, language);

  const canAfford = (user?.coins || 0) >= price;
  const isPending = user?.status === 'pending';
  const canOrder = productState.isPurchasable && !isPending && canAfford;

  const handleOrder = async () => {
    if (!playerId.trim()) {
      addToast(t('product.fillField', { field: t('product.userId') }), 'warning');
      return;
    }

    if (!canAfford) {
      addToast(t('product.insufficientBalance'), 'error');
      return;
    }

    setIsOrdering(true);

    setTimeout(() => {
      const newOrder = {
        id: `o${Date.now()}`,
        userId: user.id,
        productId: product.id,
        productName,
        priceCoins: price,
        status: 'completed',
        createdAt: new Date().toISOString(),
        playerId
      };

      addOrder(newOrder);
      updateUserCoins(user.id, -price, user);
      updateUserSession({ coins: user.coins - price });

      addToast(t('product.orderSuccess'), 'success');
      setIsOrdering(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600 flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowRight className="w-4 h-4 ml-2" /> {t('product.backToProducts')}
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className={`overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800 ${!productState.isPurchasable ? 'grayscale opacity-75' : ''}`}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="purple">{product.category}</Badge>
              {productState.badge && (
                <Badge
                  variant={
                    productState.badgeColor === 'success'
                      ? 'success'
                      : productState.badgeColor === 'danger'
                        ? 'error'
                        : productState.badgeColor === 'warning'
                          ? 'warning'
                          : 'secondary'
                  }
                >
                  {productState.badgeLabel}
                </Badge>
              )}
              {product.minimumOrderQty && product.minimumOrderQty > 1 && productState.isPurchasable && (
                <Badge variant="info">Min: {product.minimumOrderQty}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{productName}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{productDesc}</p>
          </div>

          <Card className={`p-6 border-indigo-100 dark:border-indigo-900/30 ${productState.isPurchasable ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('common.price')}</span>
              <span className={`text-3xl font-bold ${productState.isPurchasable ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                {price} $
              </span>
            </div>

            {!productState.isPurchasable && (
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 mb-4 ${
                  productState.badgeColor === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    productState.badgeColor === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium ${
                      productState.badgeColor === 'warning' ? 'text-yellow-800 dark:text-yellow-400' : 'text-red-800 dark:text-red-400'
                    }`}
                  >
                    {productState.badgeLabel}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      productState.badgeColor === 'warning' ? 'text-yellow-700 dark:text-yellow-500' : 'text-red-700 dark:text-red-500'
                    }`}
                  >
                    {productState.helperText}
                  </p>
                </div>
              </div>
            )}

            {isPending ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400">{t('product.accountPendingTitle')}</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">{t('product.accountPendingDesc')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {productState.isPurchasable && (
                  <>
                    <Input
                      label={t('product.playerIdLabel')}
                      placeholder={t('product.playerIdPlaceholder')}
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      className="bg-white dark:bg-gray-900"
                    />

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
                      <span>{t('product.currentBalance')}:</span>
                      <span className={canAfford ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                        {user?.coins} $
                      </span>
                    </div>
                  </>
                )}

                <Button
                  className="w-full py-3 text-lg flex items-center justify-center gap-2"
                  onClick={handleOrder}
                  disabled={!canOrder || isOrdering}
                  variant={canOrder ? 'primary' : 'secondary'}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOrdering
                    ? t('common.processing')
                    : canOrder
                      ? t('product.confirmOrder')
                      : productState.badgeLabel || t('common.unavailable')}
                </Button>

                {!canAfford && productState.isPurchasable && (
                  <p className="text-xs text-center text-red-500">
                    {t('product.needExtraBalance', { amount: price - (user?.coins || 0) })}
                  </p>
                )}
              </div>
            )}
          </Card>

          {productState.isPurchasable && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {t('product.instantExecution')}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">{t('product.instantExecutionDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
