import React, { useState, useEffect } from 'react';
import { Code2, RefreshCw, Database } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { fetchProducts } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ApiSandbox = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('unknown');
  const { t } = useLanguage();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProducts();
      setData(result);
      // Check if it was mock data or real API
      if (import.meta.env.VITE_API_BASE_URL) {
        setSource('API');
      } else {
        setSource('بيانات تجريبية (بديلة)');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-8 h-8 text-indigo-600" /> {t('apiSandboxTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('apiSandboxDesc')}
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('refreshData')}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">{t('responsePreview')}</h3>
              <Badge variant={source.includes('Mock') ? 'warning' : 'success'}>
                {t('source')}: {source}
              </Badge>
            </div>
            <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-auto max-h-[500px]">
              {loading ? (
                <div className="text-gray-400 italic">{t('loadingData')}</div>
              ) : error ? (
                <div className="text-red-400">خطأ: {error}</div>
              ) : (
                <pre dir="ltr">{JSON.stringify(data, null, 2)}</pre>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" /> {t('environment')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">{t('apiBaseUrl')}</label>
                <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all" dir="ltr">
                  {import.meta.env.VITE_API_BASE_URL || '(غير مهيأ)'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">{t('mode')}</label>
                <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" dir="ltr">
                  {import.meta.env.MODE}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">{t('devNoteTitle')}</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {t('devNoteDesc')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiSandbox;
