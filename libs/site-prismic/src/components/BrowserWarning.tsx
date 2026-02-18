'use client';

import { useEffect, useState } from 'react';

export function BrowserWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Detect if browser is Chrome/Chromium-based
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    // Chrome is the only one I've gotten working so far
    const isCompatible = isChrome;

    if (!isCompatible && process.env.NODE_ENV === 'development') {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ff6b6b',
      color: 'white',
      padding: '12px 20px',
      textAlign: 'center',
      zIndex: 10000,
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <strong>⚠️ Browser Compatibility Warning:</strong> Prismic preview works best in Chrome.
      Your current browser may experience issues with the preview toolbar due to cookie partitioning.
      <button
        onClick={() => setShowWarning(false)}
        style={{
          marginLeft: '15px',
          padding: '4px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid white',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
