import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileImage, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const UploadReceiptBox = ({ onFileUpload }) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
  const maxSize = 20 * 1024 * 1024;

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) return t('payments.upload.invalidType');
    if (file.size > maxSize) return t('payments.upload.invalidSize');
    return null;
  };

  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploadedFile(file);
    onFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError('');
    onFileUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragOver
                ? 'border-orange-400 bg-orange-100/60 dark:bg-orange-500/10'
                : 'border-gray-300 bg-white/80 hover:border-indigo-400 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:border-indigo-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 transition-transform ${
                  isDragOver ? 'scale-110' : ''
                }`}
              >
                <Upload className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {isDragOver ? t('payments.upload.dropHere') : t('payments.upload.uploadTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('payments.upload.uploadDescription')}</p>
                <p className="mt-2 text-xs text-gray-500">{t('payments.upload.uploadHint')}</p>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/0 to-pink-500/0 transition-all hover:from-orange-400/5 hover:to-pink-500/5" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-gray-200 bg-white/85 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/70"
        >
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-blue-500">
              <FileImage className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium text-gray-900 dark:text-white">{uploadedFile.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(uploadedFile.size)}</p>
            </div>

            <button
              onClick={handleRemoveFile}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 transition-colors hover:bg-red-500/30"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/30 bg-red-500/20 p-4"
        >
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <p>{`• ${t('payments.upload.clearTip1')}`}</p>
        <p>{`• ${t('payments.upload.clearTip2')}`}</p>
        <p>{`• ${t('payments.upload.clearTip3')}`}</p>
      </div>
    </div>
  );
};

export default UploadReceiptBox;
