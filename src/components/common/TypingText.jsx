import React, { useState, useEffect } from 'react';

/**
 * TypingText Component — Renders text character-by-character with a blinking cursor
 */
export const TypingText = ({ text, speed = 20, delay = 100, className = "", isCached = false }) => {
  const [displayText, setDisplayText] = useState(isCached ? (text || '') : '');
  const [isComplete, setIsComplete] = useState(isCached);

  useEffect(() => {
    if (isCached) {
      setDisplayText(text || '');
      setIsComplete(true);
      return;
    }
    if (!text) {
      setDisplayText('');
      setIsComplete(true);
      return;
    }
    setDisplayText('');
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText((prev) => prev + text.charAt(index));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(timer);
        }
      }, speed);
      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <span style={{ color: '#6366F1', fontWeight: 'bold', marginLeft: '2px' }} className="animate-pulse">
          |
        </span>
      )}
    </span>
  );
};

export default TypingText;
