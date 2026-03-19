import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatNumber } from '../../utils/intl';

const PaymentMethodCard = ({ method, isSelected, onClick }) => {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const getIcon = (type) => {
    switch (type) {
      case 'card':
        return CreditCard;
      case 'mobile':
        return Smartphone;
      case 'bank':
        return Building;
      default:
        return CreditCard;
    }
  };

  const Icon = getIcon(method.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-r from-orange-400/20 to-pink-500/20 border-orange-400/50 shadow-lg shadow-orange-500/10'
          : 'bg-black/40 hover:bg-black/60 border-white/10'
      } backdrop-blur-xl border rounded-xl p-4`}
    >
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`w-12 h-12 rounded-lg ${isSelected ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-white/10'} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h3 className="text-white font-semibold">{method.name}</h3>
          <p className="text-gray-400 text-sm">{method.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              method.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {method.status === 'active' ? 'متاح' : 'غير متاح'}
            </span>
          </div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </motion.div>
      )}
    </motion.div>
  );
};

const AddBalance = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const isRTL = dir === 'rtl';

  const [selectedMethod, setSelectedMethod] = useState(null);

  // Mock balance - in real app, this would come from API
  const currentBalance = 2500;
  const currentCurrency = 'EGP';

  const manualMethods = [
    {
      id: 'vodafone',
      name: 'فودافون كاش',
      description: 'ادفع من خلال فودافون كاش',
      type: 'mobile',
      status: 'active'
    },
    {
      id: 'etisalat',
      name: 'اتصالات كاش',
      description: 'ادفع من خلال اتصالات كاش',
      type: 'mobile',
      status: 'active'
    },
    {
      id: 'orange',
      name: 'أورانج كاش',
      description: 'ادفع من خلال أورانج كاش',
      type: 'mobile',
      status: 'active'
    },
    {
      id: 'bank',
      name: 'تحويل بنكي',
      description: 'ادفع من خلال التحويل البنكي',
      type: 'bank',
      status: 'active'
    },
    {
      id: 'western',
      name: 'ويسترن يونيون',
      description: 'ادفع من خلال ويسترن يونيون',
      type: 'bank',
      status: 'active'
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      navigate(`/wallet/payment-details/${selectedMethod.id}`);
    }
  };

  const handleBack = () => {
    navigate('/wallet');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir={dir}>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleBack}
          className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          العودة للمحفظة
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          <h1 className="text-3xl font-bold text-white mb-2">إضافة رصيد</h1>
          <p className="text-gray-400">جميع عمليات الشحن تتم يدويًا من خلال الإدارة</p>
        </motion.div>

        {/* Current Balance Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8"
        >
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <p className="text-gray-400 text-sm">الرصيد الحالي</p>
              <p className="text-white text-2xl font-bold">{formatNumber(currentBalance, 'en-US')} {currentCurrency}</p>
            </div>
            <div className="text-gray-400 text-sm">
              ≈ {formatNumber(Math.round(currentBalance / 50), 'en-US')} USD
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">اختر طريقة الدفع المناسبة</h2>
            <p className="text-gray-400 text-sm mb-4">
              بعد اختيار وسيلة الدفع ورفع الإيصال، سيتم مراجعة الطلب من الإدارة وإضافة الرصيد إلى المحفظة.
            </p>
            <p className="text-gray-400 text-sm">
              سيتم مراجعة طلبك من قبل الإدارة قبل تأكيد الإيداع. قد يستغرق الأمر حتى 24 ساعة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {manualMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isSelected={selectedMethod?.id === method.id}
                onClick={() => handleMethodSelect(method)}
              />
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        {selectedMethod && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              متابعة
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AddBalance;
