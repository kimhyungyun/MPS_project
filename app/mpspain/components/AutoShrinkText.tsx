'use client';

import React, { useEffect, useRef } from 'react';

interface AutoShrinkTextProps {
  text: string;
  maxFontSize?: number; // px
  minFontSize?: number; // px
  className?: string;
}

/**
 * 부모 width 안에서 줄바꿈 없이 들어가도록
 * 글자 크기를 max → min 사이에서 자동으로 줄이는 컴포넌트
 */
const AutoShrinkText: React.FC<AutoShrinkTextProps> = ({
  text,
  maxFontSize = 16,
  minFontSize = 10,
  className,
}) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const adjust = () => {
      if (!el || !parent) return;

      let size = maxFontSize;

      el.style.whiteSpace = 'nowrap';
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.textOverflow = 'ellipsis';

      if (parent.clientWidth === 0) return;

      el.style.fontSize = `${size}px`;

      while (size > minFontSize && el.scrollWidth > parent.clientWidth) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };

    adjust();
    window.addEventListener('resize', adjust);
    return () => window.removeEventListener('resize', adjust);
  }, [text, maxFontSize, minFontSize]);

  return (
    <span ref={spanRef} className={className}>
      {text}
    </span>
  );
};

export default AutoShrinkText;
