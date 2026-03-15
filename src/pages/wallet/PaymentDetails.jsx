import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import UploadReceiptBox from '../../components/payment/UploadReceiptBox';
import useAuthStore from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';

const PaymentDetails = () => {
  const { methodId } = useParams();
  const { user } = useAuthStore();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const isRTL = dir === 'rtl';

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'EGP',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  // Mock payment method data
  const paymentMethods = {
    vodafone: {
      id: 'vodafone',
      name: 'فودافون كاش',
      icon: '📱',
      accountNumber: '01012345678',
      accountName: 'IBRA Store',
      instructions: 'أرسل المبلغ المطلوب إلى الرقم أعلاه مع كتابة "شحن محفظة" في رسالة التحويل'
    },
    etisalat: {
      id: 'etisalat',
      name: 'اتصالات كاش',
      icon: '📱',
      accountNumber: '01112345678',
      accountName: 'IBRA Store',
      instructions: 'أرسل المبلغ المطلوب إلى الرقم أعلاه مع كتابة "شحن محفظة" في رسالة التحويل'
    },
    orange: {
      id: 'orange',
      name: 'أورانج كاش',
      icon: '📱',
      accountNumber: '01212345678',
      accountName: 'IBRA Store',
      instructions: 'أرسل المبلغ المطلوب إلى الرقم أعلاه مع كتابة "شحن محفظة" في رسالة التحويل'
    },
    bank: {
      id: 'bank',
      name: 'تحويل بنكي',
      icon: '🏦',
      accountNumber: '123456789012345',
      accountName: 'IBRA Store Ltd',
      bankName: 'البنك الأهلي المصري',
      instructions: 'قم بالتحويل البنكي إلى الحساب أعلاه مع كتابة "شحن محفظة" في سبب التحويل'
    },
    western: {
      id: 'western',
      name: 'ويسترن يونيون',
      icon: '💰',
      accountNumber: 'WU123456789',
      accountName: 'IBRA Store',
      instructions: 'قم بإرسال المبلغ عبر ويسترن يونيون إلى الاسم أعلاه'
    }
  };

  const selectedMethod = paymentMethods[methodId];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !selectedFile) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Mock API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real app, this would send the data to backend
      console.log('Submitting payment request:', {
        method: selectedMethod,
        amount: formData.amount,
        currency: formData.currency,
        notes: formData.notes,
        receipt: selectedFile
      });

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/wallet/add-balance');
  };

  const handleMenuClick = () => {
    // Handle mobile menu
  };

  const handleNotificationsClick = () => {
    // Handle notifications
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (!selectedMethod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">طريقة دفع غير صحيحة</h1>
          <button
            onClick={() => navigate('/wallet/add-balance')}
            className="text-orange-400 hover:text-orange-300"
          >
            العودة لاختيار طريقة الدفع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir={dir}>
      <Header
        user={user}
        onMenuClick={handleMenuClick}
        showUserInfo={true}
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleBack}
          className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          العودة لاختيار طريقة الدفع
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          <h1 className="text-3xl font-bold text-white mb-2">تفاصيل الدفع</h1>
          <p className="text-gray-400">أكمل عملية الدفع لإضافة الرصيد إلى محفظتك</p>
        </motion.div>

        {/* Selected Method Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-orange-400/20 to-pink-500/20 backdrop-blur-xl border border-orange-400/30 rounded-xl p-6 mb-8"
        >
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="text-3xl">{selectedMethod.icon}</div>
            <div>
              <h3 className="text-white font-semibold text-lg">{selectedMethod.name}</h3>
              <p className="text-gray-400">طريقة الدفع المختارة</p>
            </div>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Amount Input */}
          <div>
            <label className="block text-white font-semibold mb-2">المبلغ</label>
            <div className="flex gap-3">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="أدخل المبلغ"
                className={`flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                required
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className={`w-24 bg-black/50 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">بيانات التحويل</h3>
            <div className="space-y-4">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-400">رقم الحساب:</span>
                <span className="text-white font-mono">{selectedMethod.accountNumber}</span>
              </div>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-400">اسم المستلم:</span>
                <span className="text-white">{selectedMethod.accountName}</span>
              </div>
              {selectedMethod.bankName && (
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-400">اسم البنك:</span>
                  <span className="text-white">{selectedMethod.bankName}</span>
                </div>
              )}
              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedMethod.instructions}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Receipt */}
          <UploadReceiptBox
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onRemove={handleFileRemove}
          />

          {/* Notes */}
          <div>
            <label className="block text-white font-semibold mb-2">ملاحظات إضافية (اختياري)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
              className={`w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors resize-none ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">تم إرسال طلبك بنجاح!</p>
                <p className="text-green-300 text-sm">سيتم مراجعة طلبك خلال 24 ساعة</p>
              </div>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold">حدث خطأ في إرسال الطلب</p>
                <p className="text-red-300 text-sm">يرجى المحاولة مرة أخرى</p>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'تأكيد الدفع'
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default PaymentDetails;