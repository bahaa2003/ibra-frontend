import React, { useEffect, useState } from 'react';
import brandIconImage from '../../assets/logo-optimized.webp';

const MINIMUM_VISIBLE_MS = 520;

const AppBootLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startedAt = Date.now();
    let timeoutId;

    const hideLoader = () => {
      const elapsed = Date.now() - startedAt;
      timeoutId = window.setTimeout(
        () => setIsVisible(false),
        Math.max(MINIMUM_VISIBLE_MS - elapsed, 0)
      );
    };

    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader, { once: true });
    }

    return () => {
      window.removeEventListener('load', hideLoader);
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="app-boot-loader" role="status" aria-label="Loading">
      <div className="app-boot-loader__glow" />
      <img
        src={brandIconImage}
        alt="IBRA Store"
        className="app-boot-loader__logo"
        decoding="async"
        loading="eager"
      />
    </div>
  );
};

export default AppBootLoader;
