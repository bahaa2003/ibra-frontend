import React from 'react';
import { motion } from 'framer-motion';
import { Menu, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './ui/LanguageSwitcher';

const Header = ({ user, onMenuClick, showUserInfo = true }) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-3 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
        {isRTL ? (
          <>
            <div className="text-white text-xl font-bold">ibra</div>
            {showUserInfo && (
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-white font-semibold text-sm">{user?.name || t('common.user')}</h3>
                  <p className="text-gray-400 text-xs">
                    {user?.role ? t(`roles.${user.role}`, { defaultValue: user.role }) : t('common.customer')}
                  </p>
                </div>
              </motion.div>
            )}
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="glass" />
              <motion.button
                onClick={onMenuClick}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="glass" />
              <motion.button
                onClick={onMenuClick}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={24} />
              </motion.button>
            </div>
            {showUserInfo && (
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-sm">{user?.name || t('common.user')}</h3>
                  <p className="text-gray-400 text-xs">
                    {user?.role ? t(`roles.${user.role}`, { defaultValue: user.role }) : t('common.customer')}
                  </p>
                </div>
              </motion.div>
            )}
            <div className="text-white text-xl font-bold">ibra</div>
          </>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
